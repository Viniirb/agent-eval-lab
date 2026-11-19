import { todo } from '../todo';

export interface RunSummary {
  meanScore: number;
  runs: number;
  perTask: Record<string, number>;
}

export interface GatePolicy {
  minScore: number; // absolute floor for the mean score
  maxDrop: number; // largest allowed drop of the mean versus the baseline
  maxTaskDrop?: number; // largest allowed drop for any single task
  minRuns?: number; // fewest runs we trust (default 1)
}

/**
 * M13. Reads a results/summary.json. Throws an Error whose message joins ALL problems with "; ":
 *  - 'meanScore must be a number from 0 to 100'
 *  - 'runs must be a positive integer'
 *  - 'perTask must map task ids to numbers'
 */
export function parseSummary(json: unknown): RunSummary {
  void json;
  return todo('M13', 'implement parseSummary');
}

/**
 * M13. Should the pipeline fail? Return EVERY reason (not just the first), in this order, with these exact messages:
 *  - `mean score 60 is below the minimum 70`
 *  - `only 1 runs (minimum 3)`                         (when runs < minRuns, default minRuns = 1)
 *  - `mean score dropped 5.1 points (limit 5)`        (only with a baseline; drop = baseline - current, ROUNDED to 1 decimal in the text;
 *                                                      a drop EQUAL to the limit is allowed)
 *  - for each baseline task, in order: `task b is missing from the current run`, or when `maxTaskDrop` is set and
 *    the drop is bigger than it: `task b dropped 11 points (limit 10)`
 * `pass` is true when there are no reasons.
 */
export function evaluateGate(
  current: RunSummary,
  baseline: RunSummary | undefined,
  policy: GatePolicy,
): { pass: boolean; reasons: string[] } {
  void current;
  void baseline;
  void policy;
  return todo('M13', 'implement evaluateGate');
}
