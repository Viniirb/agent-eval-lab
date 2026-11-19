import { describe, expect, it } from 'vitest';
import { compareConditions, summarize } from '../src/stats/experiment';

describe('M12 summarize', () => {
  it('computes n, mean, sample stdev, min and max', () => {
    const s = summarize([2, 4, 4, 4, 5, 5, 7, 9]);
    expect(s.n).toBe(8);
    expect(s.mean).toBe(5);
    expect(s.stdev).toBeCloseTo(2.138, 3); // sample standard deviation (n - 1)
    expect([s.min, s.max]).toEqual([2, 9]);
  });

  it('one value has stdev 0', () => {
    expect(summarize([7])).toEqual({ n: 1, mean: 7, stdev: 0, min: 7, max: 7 });
  });

  it('an empty list throws RangeError', () => {
    expect(() => summarize([])).toThrow(RangeError);
  });
});

describe('M12 compareConditions', () => {
  it('detects a clear improvement', () => {
    const r = compareConditions([60, 62, 58, 61], [80, 82, 79, 81]);
    expect(r.delta).toBeCloseTo(20.25, 2);
    expect(r.cohensD).toBeGreaterThan(5);
    expect(r.verdict).toBe('better');
  });

  it('detects a clear regression', () => {
    expect(compareConditions([80, 82, 79, 81], [60, 62, 58, 61]).verdict).toBe('worse');
  });

  it('noise is inconclusive', () => {
    const r = compareConditions([70, 90, 60, 80], [72, 88, 62, 79]);
    expect(Math.abs(r.cohensD)).toBeLessThan(0.5);
    expect(r.verdict).toBe('inconclusive');
  });

  it('fewer than 3 runs per group is always inconclusive', () => {
    expect(compareConditions([10, 10], [90, 90, 90]).verdict).toBe('inconclusive');
    expect(compareConditions([10, 10, 10], [90, 90]).verdict).toBe('inconclusive');
  });

  it('identical scores inside each group: the sign of the delta decides', () => {
    expect(compareConditions([50, 50, 50], [60, 60, 60])).toEqual({ delta: 10, cohensD: Infinity, verdict: 'better' });
    expect(compareConditions([60, 60, 60], [50, 50, 50]).verdict).toBe('worse');
    expect(compareConditions([60, 60, 60], [60, 60, 60])).toEqual({ delta: 0, cohensD: 0, verdict: 'inconclusive' });
  });
});
