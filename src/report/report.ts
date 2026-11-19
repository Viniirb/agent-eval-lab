import type { RunResult } from '../types';
import { todo } from '../todo';

export interface AgentSummary {
  agent: string;
  runs: number;
  mean: number;
  best: number;
  worst: number;
  grade: string;
}

/**
 * M09. One line of statistics per agent: number of runs, mean score rounded to ONE decimal, best, worst and the grade of
 * the mean (use `gradeFor` from scoring/score). Sorted by mean, best first; ties broken by agent name (alphabetical).
 */
export function aggregateByAgent(runs: RunResult[]): AgentSummary[] {
  void runs;
  return todo('M09', 'implement aggregateByAgent');
}

/**
 * M09. Markdown report, EXACTLY in this format (the test compares the whole text; a final newline at the end):
 *   # Benchmark report
 *   (blank line)
 *   | Agent | Runs | Mean | Best | Worst | Grade |
 *   |---|---|---|---|---|---|
 *   | claude | 3 | 92.3 | 95 | 88 | A |
 *   (blank line, then for each task, sorted by id:)
 *   ## Task: <task id>
 *   (blank line)
 *   | Agent | Mean |
 *   |---|---|
 *   | claude | 92.3 |
 * (the per-task table uses only the runs of that task, same ordering rules)
 * With no runs the report is the title, a blank line and `No runs yet.`
 */
export function renderReport(runs: RunResult[]): string {
  void runs;
  return todo('M09', 'implement renderReport');
}
