import { gradeFor } from '../scoring/score';
import type { RunResult } from '../types';

export interface AgentSummary {
  agent: string;
  runs: number;
  mean: number;
  best: number;
  worst: number;
  grade: string;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/** One line of statistics per agent, best mean first (ties: alphabetical by agent name). */
export function aggregateByAgent(runs: RunResult[]): AgentSummary[] {
  const groups = new Map<string, number[]>();
  for (const r of runs) groups.set(r.agent, [...(groups.get(r.agent) ?? []), r.card.total]);
  return [...groups.entries()]
    .map(([agent, scores]) => {
      const mean = round1(scores.reduce((a, b) => a + b, 0) / scores.length);
      return { agent, runs: scores.length, mean, best: Math.max(...scores), worst: Math.min(...scores), grade: gradeFor(mean) };
    })
    .sort((a, b) => b.mean - a.mean || a.agent.localeCompare(b.agent));
}

/**
 * Markdown report:
 *   # Benchmark report
 *   (blank line)
 *   | Agent | Runs | Mean | Best | Worst | Grade |
 *   |---|---|---|---|---|---|
 *   | claude | 3 | 92.3 | 95 | 88 | A |
 *   (blank line, then for each task, sorted by id:)
 *   ## Task: <task id>
 *   | Agent | Mean |
 *   |---|---|
 *   | claude | 92.3 |
 * With no runs, the report says "No runs yet." under the title.
 */
export function renderReport(runs: RunResult[]): string {
  const lines: string[] = ['# Benchmark report', ''];
  if (runs.length === 0) return [...lines, 'No runs yet.', ''].join('\n');

  lines.push('| Agent | Runs | Mean | Best | Worst | Grade |', '|---|---|---|---|---|---|');
  for (const s of aggregateByAgent(runs)) {
    lines.push(`| ${s.agent} | ${s.runs} | ${s.mean} | ${s.best} | ${s.worst} | ${s.grade} |`);
  }

  const tasks = [...new Set(runs.map((r) => r.task))].sort();
  for (const task of tasks) {
    lines.push('', `## Task: ${task}`, '', '| Agent | Mean |', '|---|---|');
    for (const s of aggregateByAgent(runs.filter((r) => r.task === task))) lines.push(`| ${s.agent} | ${s.mean} |`);
  }
  return lines.join('\n') + '\n';
}
