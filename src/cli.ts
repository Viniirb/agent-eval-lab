#!/usr/bin/env node
// CLI glue (given). Usage:
//   npm run bench -- lint tasks/001-rate-limiter
//   npm run bench -- run tasks/001-rate-limiter fake-golden
//   npm run bench -- run tasks/001-rate-limiter claude --agents agents.json --runs 3
//   npm run bench -- report results/runs.json
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { loadAgents, overlayAgent, processRunner } from './agents/adapters';
import { runBenchmark } from './pipeline/pipeline';
import { renderReport } from './report/report';
import { lintTask } from './tasks/lint';
import type { RunResult } from './types';

function flag(args: string[], name: string, fallback?: string): string | undefined {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
}

async function main(argv: string[]): Promise<number> {
  const [command, ...rest] = argv;

  if (command === 'lint') {
    const problems = await lintTask(resolve(rest[0] ?? ''));
    problems.forEach((p) => console.log(`✘ ${p}`));
    console.log(problems.length === 0 ? '✔ task is valid' : `✘ ${problems.length} problem(s)`);
    return problems.length === 0 ? 0 : 1;
  }

  if (command === 'run') {
    const taskDir = resolve(rest[0] ?? '');
    const agentName = rest[1] ?? 'fake-golden';
    const runs = Number(flag(rest, 'runs', '1'));
    const outDir = resolve(flag(rest, 'out', 'results') as string);
    const results: RunResult[] = [];

    for (let run = 1; run <= runs; run++) {
      let agent;
      let runner = processRunner;
      if (agentName === 'fake-golden') {
        agent = { name: agentName, command: 'true', args: [], timeoutMs: 5000 };
        runner = overlayAgent(join(taskDir, 'golden'));
      } else {
        const list = loadAgents(JSON.parse(await readFile(resolve(flag(rest, 'agents', 'agents.json') as string), 'utf8')));
        agent = list.find((a) => a.name === agentName);
        if (!agent) throw new Error(`unknown agent "${agentName}"`);
      }
      const outcome = await runBenchmark({
        taskDir,
        agent,
        runner,
        workRoot: resolve('.work'),
        nodeModulesFrom: resolve('node_modules'),
        run,
      });
      console.log(`run ${run}: ${outcome.card.total} (${outcome.card.grade})${outcome.card.capped ? ` capped: ${outcome.card.capped}` : ''}`);
      results.push({ task: outcome.task, agent: outcome.agent, run, card: outcome.card, durationMs: outcome.durationMs });
    }
    await mkdir(outDir, { recursive: true });
    await writeFile(join(outDir, 'runs.json'), JSON.stringify(results, null, 2));
    console.log(`saved ${join(outDir, 'runs.json')}`);
    return 0;
  }

  if (command === 'report') {
    const runs = JSON.parse(await readFile(resolve(rest[0] ?? 'results/runs.json'), 'utf8')) as RunResult[];
    console.log(renderReport(runs));
    return 0;
  }

  console.log('usage: bench lint <taskDir> | run <taskDir> <agent|fake-golden> [--runs N --agents file --out dir] | report <runs.json>');
  return 2;
}

main(process.argv.slice(2)).then(
  (code) => process.exit(code),
  (error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  },
);
