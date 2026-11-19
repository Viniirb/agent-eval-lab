import type { Grade, ScoreCard, ScoreInput, Weights } from '../types';
import { todo } from '../todo';

/** Given: the default weights (60% functional, 20% rules, 10% scope, 10% quality). Changing them is an experiment. */
export const DEFAULT_WEIGHTS: Weights = { functional: 0.6, rules: 0.2, scope: 0.1, quality: 0.1 };

/** M06. A at 90 or more, B at 75, C at 60, D at 40, otherwise F. */
export function gradeFor(total: number): Grade {
  void total;
  return todo('M06', 'implement gradeFor');
}

/**
 * M06. Turns evidence into one score card (0..100).
 *  functional = input.functional, or 0 when the tests did not run
 *  rules      = 1 - (DISTINCT violated rule ids / totalRules); 1 when there are no rules
 *  scope      = 0 when a protected file was touched; otherwise 1 - 0.25 per out-of-scope file
 *               (plus 0.25 more when `tooManyFiles`), never below 0
 *  quality    = max(0, 1 - 0.1 per type error)
 *  total      = 100 * (weighted sum), weights must add up to 1 (otherwise throw RangeError), rounded to ONE decimal
 * Caps, applied after the sum (and the lowest one wins when both apply):
 *  - a protected file was touched  => total at most 40, `capped = 'protected files were modified'`
 *  - the tests did not run         => total at most 30, `capped = 'the acceptance tests did not run'`
 * `capped` is set only when a cap actually lowered the total. `grade` comes from `gradeFor(total)`.
 * `breakdown` holds the four parts (0..1) after the rules above.
 */
export function computeScore(input: ScoreInput, weights: Weights = DEFAULT_WEIGHTS): ScoreCard {
  void input;
  void weights;
  return todo('M06', 'implement computeScore');
}
