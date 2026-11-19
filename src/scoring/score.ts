import type { Grade, ScoreCard, ScoreInput, Weights } from '../types';

export const DEFAULT_WEIGHTS: Weights = { functional: 0.6, rules: 0.2, scope: 0.1, quality: 0.1 };

export function gradeFor(total: number): Grade {
  if (total >= 90) return 'A';
  if (total >= 75) return 'B';
  if (total >= 60) return 'C';
  if (total >= 40) return 'D';
  return 'F';
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Turns evidence into one score (0..100).
 *  functional = input.functional, or 0 when the tests did not run
 *  rules      = 1 - (DISTINCT violated rule ids / totalRules); 1 when there are no rules
 *  scope      = 0 when a protected file was touched; else 1 - 0.25 per out-of-scope file (and 0.25 more if too many files), min 0
 *  quality    = max(0, 1 - 0.1 per type error)
 *  total      = 100 * weighted sum (weights must add up to 1, otherwise throw RangeError), rounded to 1 decimal
 * Caps (applied after the sum): protected files touched => at most 40; tests did not run => at most 30.
 * When a cap lowers the total, `capped` explains why (the lowest cap wins).
 */
export function computeScore(input: ScoreInput, weights: Weights = DEFAULT_WEIGHTS): ScoreCard {
  const sum = weights.functional + weights.rules + weights.scope + weights.quality;
  if (Math.abs(sum - 1) > 1e-9) throw new RangeError(`weights must add up to 1 (got ${sum})`);

  const functional = input.testsRan ? clamp(input.functional) : 0;
  const violated = new Set(input.rules.violations.map((v) => v.ruleId)).size;
  const rules = input.rules.totalRules === 0 ? 1 : clamp(1 - violated / input.rules.totalRules);
  const scope =
    input.scope.protectedTouched.length > 0
      ? 0
      : clamp(1 - 0.25 * (input.scope.outOfScope.length + (input.scope.tooManyFiles ? 1 : 0)));
  const quality = clamp(1 - 0.1 * input.quality.typecheckErrors);

  let total = 100 * (weights.functional * functional + weights.rules * rules + weights.scope * scope + weights.quality * quality);
  let capped: string | undefined;
  if (input.scope.protectedTouched.length > 0 && total > 40) {
    total = 40;
    capped = 'protected files were modified';
  }
  if (!input.testsRan && total > 30) {
    total = 30;
    capped = 'the acceptance tests did not run';
  }

  total = round1(total);
  const card: ScoreCard = { total, grade: gradeFor(total), breakdown: { functional, rules, scope, quality } };
  if (capped) card.capped = capped;
  return card;
}

function clamp(n: number): number {
  return Math.min(1, Math.max(0, n));
}
