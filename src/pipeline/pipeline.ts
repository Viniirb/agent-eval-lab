import { cp, readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { requirementCoverage } from '../acceptance/coverage';
import { buildInvocation, type AgentRunner } from '../agents/adapters';
import { checkRules } from '../rules/check';
import { parseRules } from '../rules/rules';
import { computeScore } from '../scoring/score';
import { checkScope } from '../scope/scope';
import { diffSnapshots, prepareWorkdir, runCommand, snapshot } from '../sandbox/sandbox';
import { parseSpec } from '../spec/spec';
import { parseTaskConfig } from '../tasks/lint';
import type { AgentConfig, Coverage, FileChange, RunResult, ScopeReport, TestResult, Violation } from '../types';

/**
 * Reads the JSON that `vitest run --reporter=json` writes.
 * Shape: { testResults: [{ assertionResults: [{ fullName, status }] }] }.
 * `status` "passed" => passed, "failed" => failed, anything else (pending, skipped, todo) => skipped.
 * Use `fullName` as the title: it includes the describe() names, where tags like [R1] may live.
 * Malformed input throws an Error.
 */
export function parseVitestJson(json: unknown): TestResult[] {
  const root = json as { testResults?: { assertionResults?: { fullName?: string; title?: string; status?: string }[] }[] };
  if (!root || !Array.isArray(root.testResults)) throw new Error('not a vitest JSON report');
  const results: TestResult[] = [];
  for (const file of root.testResults) {
    for (const t of file.assertionResults ?? []) {
      results.push({
        title: t.fullName ?? t.title ?? '',
        status: t.status === 'passed' ? 'passed' : t.status === 'failed' ? 'failed' : 'skipped',
      });
    }
  }
  return results;
}

/** Counts TypeScript errors in `tsc` output: one per line containing "error TS1234". */
export function countTypeErrors(output: string): number {
  return output.split('\n').filter((line) => /error TS\d+/.test(line)).length;
}

export interface BenchmarkOptions {
  taskDir: string;
  agent: AgentConfig;
  runner: AgentRunner;
  workRoot: string; // where the isolated working copies are created
  nodeModulesFrom: string; // this repo's node_modules, shared by every working copy
  run?: number; // 1-based, default 1
}

export interface BenchmarkOutcome extends RunResult {
  coverage: Coverage;
  violations: Violation[];
  scope: ScopeReport;
  changes: FileChange[];
  typecheckErrors: number;
  testsRan: boolean;
  transcript: string;
}

async function readAll(dir: string, paths: string[]): Promise<Record<string, string>> {
  const files: Record<string, string> = {};
  for (const path of paths) {
    const full = join(dir, path);
    const size = (await stat(full)).size;
    files[path] = size > 500_000 ? '' : await readFile(full, 'utf8').catch(() => '');
  }
  return files;
}

/**
 * The whole benchmark for ONE task and ONE agent run:
 *  1. read task.json, SPEC.md, RULES.md
 *  2. prepare an isolated working copy (starter + acceptance + shared node_modules)
 *  3. snapshot, run the agent with the task prompt (cwd = working copy), snapshot again, diff
 *  4. run the acceptance tests with vitest (JSON reporter), run tsc, read all files
 *  5. coverage + rules + scope + quality, then computeScore
 * Note: the agent's own failure (non-zero exit, timeout) does not throw: it simply earns a low score.
 */
export async function runBenchmark(options: BenchmarkOptions): Promise<BenchmarkOutcome> {
  const { taskDir, agent, runner } = options;
  const task = parseTaskConfig(JSON.parse(await readFile(join(taskDir, 'task.json'), 'utf8')));
  const requirements = parseSpec(await readFile(join(taskDir, 'SPEC.md'), 'utf8'));
  const rules = parseRules(await readFile(join(taskDir, 'RULES.md'), 'utf8'));

  const run = options.run ?? 1;
  const workdir = join(options.workRoot, `${task.id}-${agent.name}-${run}`);
  await prepareWorkdir({
    starterDir: join(taskDir, 'starter'),
    acceptanceDir: join(taskDir, 'acceptance'),
    targetDir: workdir,
    nodeModulesFrom: options.nodeModulesFrom,
  });

  // The agent must SEE the spec and the rules, so both are copied in (and are protected by the task policy).
  await cp(join(taskDir, 'SPEC.md'), join(workdir, 'SPEC.md'));
  await cp(join(taskDir, 'RULES.md'), join(workdir, 'RULES.md'));

  const before = await snapshot(workdir);
  const started = Date.now();
  const agentResult = await runner(buildInvocation(agent, { prompt: task.prompt, workdir }));
  const durationMs = Date.now() - started;
  const after = await snapshot(workdir);

  const changes = diffSnapshots(before, after);
  const scope = checkScope(changes, { allowed: task.allowed, protected: task.protected, maxFilesChanged: task.maxFilesChanged });

  const reportFile = join(workdir, '.vitest-report.json');
  await runCommand(join(workdir, 'node_modules', '.bin', 'vitest'), ['run', '--root', workdir, '--reporter=json', `--outputFile=${reportFile}`], {
    cwd: workdir,
    timeoutMs: task.testTimeoutMs ?? 60_000,
  });
  let tests: TestResult[] = [];
  let testsRan = false;
  try {
    tests = parseVitestJson(JSON.parse(await readFile(reportFile, 'utf8')));
    testsRan = tests.length > 0;
  } catch {
    testsRan = false;
  }

  const tsc = await runCommand(join(workdir, 'node_modules', '.bin', 'tsc'), ['--noEmit', '-p', workdir], { cwd: workdir, timeoutMs: 60_000 });
  const typecheckErrors = countTypeErrors(tsc.stdout + tsc.stderr);

  const finalSnapshot = await snapshot(workdir);
  const files = await readAll(workdir, Object.keys(finalSnapshot).filter((p) => p !== '.vitest-report.json'));
  const violations = checkRules(rules, files);
  const coverage = requirementCoverage(requirements, tests);

  const card = computeScore({
    functional: coverage.weighted,
    testsRan,
    rules: { violations, totalRules: rules.length },
    scope,
    quality: { typecheckErrors },
  });

  return {
    task: task.id,
    agent: agent.name,
    run,
    card,
    durationMs,
    coverage,
    violations,
    scope,
    changes,
    typecheckErrors,
    testsRan,
    transcript: (agentResult.stdout + agentResult.stderr).slice(0, 20_000),
  };
}

/** Lists task folders (those containing task.json) under `tasksDir`, sorted. */
export async function listTasks(tasksDir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(tasksDir, { withFileTypes: true })) {
    if (entry.isDirectory() && (await stat(join(tasksDir, entry.name, 'task.json')).then(() => true, () => false))) {
      out.push(join(tasksDir, entry.name));
    }
  }
  return out.sort();
}
