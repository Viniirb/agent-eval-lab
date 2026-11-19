import type { ScoreCard } from '../types';
import { todo } from '../todo';

export interface BenchmarkResult {
  golden: number;
  mutants: { name: string; score: number }[];
}

export interface Thresholds {
  goldenMin: number;
  mutantMax: number;
}

/**
 * M10. "Who tests the tests?" A benchmark is trustworthy only if:
 *  - the GOLDEN solution (known good) scores at least `goldenMin` (default 95), and
 *  - every MUTANT (known bad) scores BELOW `mutantMax` (default 95): it must not reach the golden zone, so the tests catch it, and
 *  - there is at least one mutant.
 * Return every problem found, with these exact messages:
 *   `golden solution scores 80, expected at least 95`
 *   `mutant "weak" scores 96: the tests are too weak (limit 95)`
 *   'no mutants: the tests were never challenged'
 * `ok` is true when there are no problems.
 */
export function validateBenchmark(
  result: BenchmarkResult,
  thresholds: Thresholds = { goldenMin: 95, mutantMax: 95 },
): { ok: boolean; problems: string[] } {
  void result;
  void thresholds;
  return todo('M10', 'implement validateBenchmark');
}

/** M10. The same input should give the same score. A spread (max - min) BIGGER than `tolerance` (default 2) means flaky. Fewer than 2 scores: false. */
export function detectFlaky(scores: number[], tolerance = 2): boolean {
  void scores;
  void tolerance;
  return todo('M10', 'implement detectFlaky');
}

/**
 * M10. Evaluates the golden overlay first and then each mutant, in order, with the caller-provided `evaluate(overlayDir)`
 * (real runs use the pipeline; tests pass a fake), takes `card.total` of each and validates with `validateBenchmark`.
 */
export async function validateTask(
  overlays: { golden: string; mutants: { name: string; dir: string }[] },
  evaluate: (overlayDir: string) => Promise<ScoreCard>,
): Promise<{ ok: boolean; problems: string[] }> {
  void overlays;
  void evaluate;
  return todo('M10', 'implement validateTask');
}
