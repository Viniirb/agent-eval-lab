import type { ScoreCard } from '../types';

export interface BenchmarkResult {
  golden: number;
  mutants: { name: string; score: number }[];
}

export interface Thresholds {
  goldenMin: number;
  mutantMax: number;
}

/**
 * "Who tests the tests?" A benchmark is trustworthy only if:
 *  - the GOLDEN solution (known good) scores at least `goldenMin` (default 95), and
 *  - every MUTANT (known bad) scores below `mutantMax` (default 95): it must not reach the golden zone, so the tests catch it.
 * Returns every problem found, with the names of the guilty mutants.
 */
export function validateBenchmark(
  result: BenchmarkResult,
  thresholds: Thresholds = { goldenMin: 95, mutantMax: 95 },
): { ok: boolean; problems: string[] } {
  const problems: string[] = [];
  if (result.golden < thresholds.goldenMin) {
    problems.push(`golden solution scores ${result.golden}, expected at least ${thresholds.goldenMin}`);
  }
  if (result.mutants.length === 0) problems.push('no mutants: the tests were never challenged');
  for (const m of result.mutants) {
    if (m.score >= thresholds.mutantMax) {
      problems.push(`mutant "${m.name}" scores ${m.score}: the tests are too weak (limit ${thresholds.mutantMax})`);
    }
  }
  return { ok: problems.length === 0, problems };
}

/** The same input should give the same score. A spread bigger than `tolerance` points means a flaky benchmark. */
export function detectFlaky(scores: number[], tolerance = 2): boolean {
  if (scores.length < 2) return false;
  return Math.max(...scores) - Math.min(...scores) > tolerance;
}

/**
 * Evaluates the golden overlay and each mutant overlay with a caller-provided `evaluate(overlayDir)`
 * (real runs use the pipeline; tests pass a fake) and validates the result.
 */
export async function validateTask(
  overlays: { golden: string; mutants: { name: string; dir: string }[] },
  evaluate: (overlayDir: string) => Promise<ScoreCard>,
): Promise<{ ok: boolean; problems: string[] }> {
  const golden = (await evaluate(overlays.golden)).total;
  const mutants = [];
  for (const m of overlays.mutants) mutants.push({ name: m.name, score: (await evaluate(m.dir)).total });
  return validateBenchmark({ golden, mutants });
}
