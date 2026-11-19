import { describe, expect, it } from 'vitest';
import { aggregateByAgent, renderReport } from '../src/report/report';
import type { RunResult, ScoreCard } from '../src/types';

const card = (total: number): ScoreCard => ({
  total,
  grade: total >= 90 ? 'A' : total >= 75 ? 'B' : total >= 60 ? 'C' : total >= 40 ? 'D' : 'F',
  breakdown: { functional: 1, rules: 1, scope: 1, quality: 1 },
});
const run = (task: string, agent: string, n: number, total: number): RunResult => ({ task, agent, run: n, card: card(total), durationMs: 1000 });

const runs: RunResult[] = [
  run('t1', 'claude', 1, 100),
  run('t1', 'claude', 2, 90),
  run('t2', 'claude', 1, 80),
  run('t1', 'codex', 1, 70),
  run('t2', 'codex', 1, 60),
];

describe('M09 aggregateByAgent', () => {
  it('computes mean, best, worst and grade per agent, best mean first', () => {
    expect(aggregateByAgent(runs)).toEqual([
      { agent: 'claude', runs: 3, mean: 90, best: 100, worst: 80, grade: 'A' },
      { agent: 'codex', runs: 2, mean: 65, best: 70, worst: 60, grade: 'C' },
    ]);
  });

  it('rounds the mean to one decimal and breaks ties by name', () => {
    const r = aggregateByAgent([run('t', 'b', 1, 50), run('t', 'a', 1, 50), run('t', 'a', 2, 51)]);
    expect(r.map((x) => x.agent)).toEqual(['a', 'b']);
    expect(r[0]?.mean).toBe(50.5);
  });

  it('is empty without runs', () => {
    expect(aggregateByAgent([])).toEqual([]);
  });
});

describe('M09 renderReport', () => {
  it('renders the agent table and one section per task', () => {
    expect(renderReport(runs)).toBe(
      [
        '# Benchmark report',
        '',
        '| Agent | Runs | Mean | Best | Worst | Grade |',
        '|---|---|---|---|---|---|',
        '| claude | 3 | 90 | 100 | 80 | A |',
        '| codex | 2 | 65 | 70 | 60 | C |',
        '',
        '## Task: t1',
        '',
        '| Agent | Mean |',
        '|---|---|',
        '| claude | 95 |',
        '| codex | 70 |',
        '',
        '## Task: t2',
        '',
        '| Agent | Mean |',
        '|---|---|',
        '| claude | 80 |',
        '| codex | 60 |',
        '',
      ].join('\n'),
    );
  });

  it('says so when there are no runs', () => {
    expect(renderReport([])).toBe('# Benchmark report\n\nNo runs yet.\n');
  });

  it('sorts tasks by id', () => {
    const text = renderReport([run('b', 'x', 1, 1), run('a', 'x', 1, 1)]);
    expect(text.indexOf('## Task: a')).toBeLessThan(text.indexOf('## Task: b'));
  });
});
