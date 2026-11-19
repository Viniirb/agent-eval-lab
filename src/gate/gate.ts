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

/** Reads a results/summary.json. Throws an Error listing the problems when it is malformed. */
export function parseSummary(json: unknown): RunSummary {
  const s = (typeof json === 'object' && json !== null ? json : {}) as Record<string, unknown>;
  const problems: string[] = [];
  if (typeof s.meanScore !== 'number' || s.meanScore < 0 || s.meanScore > 100) problems.push('meanScore must be a number from 0 to 100');
  if (!Number.isInteger(s.runs) || (s.runs as number) < 1) problems.push('runs must be a positive integer');
  const perTask = s.perTask as Record<string, unknown> | undefined;
  if (typeof perTask !== 'object' || perTask === null || !Object.values(perTask).every((v) => typeof v === 'number')) {
    problems.push('perTask must map task ids to numbers');
  }
  if (problems.length > 0) throw new Error(problems.join('; '));
  return s as unknown as RunSummary;
}

/**
 * Should the pipeline fail? Returns every reason (not just the first):
 *  - mean score below `minScore`
 *  - fewer runs than `minRuns`
 *  - the mean dropped by more than `maxDrop` versus the baseline (when there is a baseline)
 *  - a task present in the baseline is missing now, or dropped by more than `maxTaskDrop`
 * A drop of exactly the limit is allowed. `pass` is true when there are no reasons.
 */
export function evaluateGate(
  current: RunSummary,
  baseline: RunSummary | undefined,
  policy: GatePolicy,
): { pass: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (current.meanScore < policy.minScore) reasons.push(`mean score ${current.meanScore} is below the minimum ${policy.minScore}`);
  if (current.runs < (policy.minRuns ?? 1)) reasons.push(`only ${current.runs} runs (minimum ${policy.minRuns})`);

  if (baseline) {
    const drop = baseline.meanScore - current.meanScore;
    if (drop > policy.maxDrop) reasons.push(`mean score dropped ${round(drop)} points (limit ${policy.maxDrop})`);
    for (const [task, before] of Object.entries(baseline.perTask)) {
      const now = current.perTask[task];
      if (now === undefined) {
        reasons.push(`task ${task} is missing from the current run`);
      } else if (policy.maxTaskDrop !== undefined && before - now > policy.maxTaskDrop) {
        reasons.push(`task ${task} dropped ${round(before - now)} points (limit ${policy.maxTaskDrop})`);
      }
    }
  }
  return { pass: reasons.length === 0, reasons };
}

const round = (n: number) => Math.round(n * 10) / 10;
