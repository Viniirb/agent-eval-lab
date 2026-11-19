import { describe, expect, it } from 'vitest';
import { computeScore, DEFAULT_WEIGHTS, gradeFor } from '../src/scoring/score';
import type { ScoreInput } from '../src/types';

const clean: ScoreInput = {
  functional: 1,
  testsRan: true,
  rules: { violations: [], totalRules: 4 },
  scope: { ok: true, outOfScope: [], protectedTouched: [], tooManyFiles: false },
  quality: { typecheckErrors: 0 },
};

const withInput = (patch: Partial<ScoreInput>): ScoreInput => ({ ...clean, ...patch });

describe('M06 gradeFor', () => {
  it('uses the boundaries 90, 75, 60, 40', () => {
    expect([100, 90, 89.9, 75, 74.9, 60, 59.9, 40, 39.9, 0].map(gradeFor)).toEqual(['A', 'A', 'B', 'B', 'C', 'C', 'D', 'D', 'F', 'F']);
  });
});

describe('M06 computeScore', () => {
  it('a perfect run scores 100 and A', () => {
    expect(computeScore(clean)).toEqual({
      total: 100,
      grade: 'A',
      breakdown: { functional: 1, rules: 1, scope: 1, quality: 1 },
    });
  });

  it('functional coverage counts 60 points', () => {
    expect(computeScore(withInput({ functional: 0.5 })).total).toBe(70);
  });

  it('rules count distinct violated rule ids, not occurrences', () => {
    const v = (ruleId: string) => ({ ruleId, message: 'x' });
    const one = computeScore(withInput({ rules: { violations: [v('RULE-001'), v('RULE-001'), v('RULE-001')], totalRules: 4 } }));
    expect(one.breakdown.rules).toBe(0.75);
    expect(one.total).toBe(95);
    const all = computeScore(withInput({ rules: { violations: [v('RULE-001'), v('RULE-002')], totalRules: 2 } }));
    expect(all.breakdown.rules).toBe(0);
  });

  it('a project without rules gets full rules score', () => {
    expect(computeScore(withInput({ rules: { violations: [], totalRules: 0 } })).breakdown.rules).toBe(1);
  });

  it('out-of-scope files cost 25% of the scope score each, and too many files another 25%', () => {
    const scope = { ok: false, outOfScope: ['a', 'b'], protectedTouched: [], tooManyFiles: true };
    expect(computeScore(withInput({ scope })).breakdown.scope).toBe(0.25);
    const many = { ok: false, outOfScope: ['a', 'b', 'c', 'd', 'e'], protectedTouched: [], tooManyFiles: false };
    expect(computeScore(withInput({ scope: many })).breakdown.scope).toBe(0);
  });

  it('type errors cost 10% of the quality score each', () => {
    expect(computeScore(withInput({ quality: { typecheckErrors: 3 } })).breakdown.quality).toBeCloseTo(0.7);
    expect(computeScore(withInput({ quality: { typecheckErrors: 30 } })).breakdown.quality).toBe(0);
  });

  it('touching protected files zeroes the scope and caps the total at 40', () => {
    const scope = { ok: false, outOfScope: [], protectedTouched: ['acceptance/a.test.ts'], tooManyFiles: false };
    const card = computeScore(withInput({ scope }));
    expect(card.breakdown.scope).toBe(0);
    expect(card.total).toBe(40);
    expect(card.grade).toBe('D');
    expect(card.capped).toBe('protected files were modified');
  });

  it('a cap that does not bind leaves the score alone', () => {
    const scope = { ok: false, outOfScope: [], protectedTouched: ['SPEC.md'], tooManyFiles: false };
    const card = computeScore(withInput({ scope, functional: 0 }));
    expect(card.total).toBe(30);
    expect(card.capped).toBeUndefined();
  });

  it('when tests did not run, functional is 0 and the total is capped at 30', () => {
    const card = computeScore(withInput({ testsRan: false, functional: 1 }));
    expect(card.breakdown.functional).toBe(0);
    expect(card.total).toBe(30);
    expect(card.capped).toBe('the acceptance tests did not run');
    expect(card.grade).toBe('F');
  });

  it('rounds to one decimal', () => {
    expect(computeScore(withInput({ functional: 1 / 3 })).total).toBe(60);
    expect(computeScore(withInput({ functional: 0.123456 })).total).toBe(Math.round((7.40736 + 40) * 10) / 10);
  });

  it('accepts custom weights that add up to 1 and rejects others', () => {
    const only = { functional: 1, rules: 0, scope: 0, quality: 0 };
    expect(computeScore(withInput({ functional: 0.5 }), only).total).toBe(50);
    expect(() => computeScore(clean, { ...DEFAULT_WEIGHTS, functional: 0.9 })).toThrow(RangeError);
  });
});
