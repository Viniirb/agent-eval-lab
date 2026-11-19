import type { AgentRunner } from '../agents/adapters';
import type { AgentConfig, Coverage, FileChange, RunResult, ScopeReport, TestResult, Violation } from '../types';
import { todo } from '../todo';

/**
 * M15. Reads the JSON that `vitest run --reporter=json` writes.
 * Shape: { testResults: [{ assertionResults: [{ fullName, title, status }] }] }.
 * `status` "passed" => passed, "failed" => failed, anything else (pending, skipped, todo) => skipped.
 * Use `fullName` as the title (it includes describe() names, where tags like [R1] may live); fall back to `title`, then ''.
 * Input that is not a vitest report throws `Error('not a vitest JSON report')`.
 */
export function parseVitestJson(json: unknown): TestResult[] {
  void json;
  return todo('M15', 'implement parseVitestJson');
}

/** M15. Counts TypeScript errors in `tsc` output: one per line containing "error TS1234". */
export function countTypeErrors(output: string): number {
  void output;
  return todo('M15', 'implement countTypeErrors');
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

/**
 * M15. The whole benchmark for ONE task and ONE agent run. Steps:
 *  1. read `task.json` (parseTaskConfig), `SPEC.md` (parseSpec) and `RULES.md` (parseRules) from `taskDir`
 *  2. workdir = `<workRoot>/<task.id>-<agent.name>-<run>`; `prepareWorkdir` with starter/, acceptance/ and node_modules
 *  3. copy `SPEC.md` and `RULES.md` into the workdir (the agent must SEE them; they are protected by the task policy)
 *  4. `snapshot` before, run the agent (`buildInvocation` with the task prompt, then `runner`), `snapshot` after, `diffSnapshots`
 *  5. `checkScope` with the task's allowed/protected/maxFilesChanged
 *  6. run the acceptance tests: `<workdir>/node_modules/.bin/vitest run --root <workdir> --reporter=json --outputFile=<file>`
 *     (use runCommand with cwd = workdir and `task.testTimeoutMs ?? 60000`); read the file with `parseVitestJson`.
 *     `testsRan` is true only when the report exists, parses, and has at least one test
 *  7. `<workdir>/node_modules/.bin/tsc --noEmit -p <workdir>` and `countTypeErrors(stdout + stderr)`
 *  8. read ALL files of the final snapshot (as text; use '' for files over 500 KB and skip the vitest report file) and `checkRules`
 *  9. `requirementCoverage`, then `computeScore({ functional: coverage.weighted, testsRan, rules: { violations, totalRules },
 *     scope, quality: { typecheckErrors } })`
 * 10. return the RunResult fields (task id, agent name, run, card, agent duration) plus coverage, violations, scope, changes,
 *     typecheckErrors, testsRan and a `transcript` (agent stdout + stderr, first 20000 characters)
 * The agent failing (non-zero exit, timeout) must NOT throw: it just earns a low score.
 */
export async function runBenchmark(options: BenchmarkOptions): Promise<BenchmarkOutcome> {
  void options;
  return todo('M15', 'implement runBenchmark');
}

/** M15. Lists the task folders (the ones that contain a `task.json`) under `tasksDir`, as full paths, sorted. */
export async function listTasks(tasksDir: string): Promise<string[]> {
  void tasksDir;
  return todo('M15', 'implement listTasks');
}
