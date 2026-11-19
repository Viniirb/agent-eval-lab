import { describe, expect, it } from 'vitest';
import { detectFlaky, validateBenchmark, validateTask } from '../src/validation/golden';
import type { ScoreCard } from '../src/types';

const card = (total: number): ScoreCard => ({ total, grade: 'A', breakdown: { functional: 1, rules: 1, scope: 1, quality: 1 } });

describe('M10 validateBenchmark', () => {
  it('a strong golden and weak mutants is a trustworthy benchmark', () => {
    expect(validateBenchmark({ golden: 100, mutants: [{ name: 'm1', score: 90 }, { name: 'm2', score: 50 }] })).toEqual({ ok: true, problems: [] });
  });

  it('flags a golden solution below 95', () => {
    const r = validateBenchmark({ golden: 80, mutants: [{ name: 'm1', score: 10 }] });
    expect(r.ok).toBe(false);
    expect(r.problems).toEqual(['golden solution scores 80, expected at least 95']);
  });

  it('names every mutant that reaches the golden zone', () => {
    const r = validateBenchmark({ golden: 100, mutants: [{ name: 'weak', score: 96 }, { name: 'ok', score: 60 }, { name: 'worse', score: 95 }] });
    expect(r.problems).toEqual([
      'mutant "weak" scores 96: the tests are too weak (limit 95)',
      'mutant "worse" scores 95: the tests are too weak (limit 95)',
    ]);
  });

  it('requires at least one mutant', () => {
    expect(validateBenchmark({ golden: 100, mutants: [] }).problems).toEqual(['no mutants: the tests were never challenged']);
  });

  it('accepts custom thresholds', () => {
    expect(validateBenchmark({ golden: 85, mutants: [{ name: 'm', score: 70 }] }, { goldenMin: 80, mutantMax: 75 }).ok).toBe(true);
  });
});

describe('M10 detectFlaky', () => {
  it('is flaky when the spread is bigger than the tolerance', () => {
    expect(detectFlaky([90, 90, 90])).toBe(false);
    expect(detectFlaky([90, 92])).toBe(false);
    expect(detectFlaky([90, 92.1])).toBe(true);
    expect(detectFlaky([100, 70, 100], 5)).toBe(true);
  });

  it('needs at least two scores', () => {
    expect(detectFlaky([])).toBe(false);
    expect(detectFlaky([50])).toBe(false);
  });
});

describe('M10 validateTask', () => {
  it('evaluates the golden overlay and every mutant', async () => {
    const seen: string[] = [];
    const scores: Record<string, number> = { g: 100, a: 90, b: 40 };
    const result = await validateTask(
      { golden: 'g', mutants: [{ name: 'm1', dir: 'a' }, { name: 'm2', dir: 'b' }] },
      async (dir) => {
        seen.push(dir);
        return card(scores[dir] as number);
      },
    );
    expect(seen).toEqual(['g', 'a', 'b']);
    expect(result).toEqual({ ok: true, problems: [] });
  });

  it('propagates problems', async () => {
    const result = await validateTask({ golden: 'g', mutants: [{ name: 'm1', dir: 'a' }] }, async () => card(100));
    expect(result.ok).toBe(false);
    expect(result.problems[0]).toContain('mutant "m1"');
  });
});
