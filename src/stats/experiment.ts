import { todo } from '../todo';

export interface Summary {
  n: number;
  mean: number;
  stdev: number; // sample standard deviation (divide by n - 1); 0 when n < 2
  min: number;
  max: number;
}

/** M12. Descriptive statistics. An empty list throws RangeError. */
export function summarize(values: number[]): Summary {
  void values;
  return todo('M12', 'implement summarize');
}

export interface Comparison {
  delta: number; // mean(treatment) - mean(baseline)
  cohensD: number; // effect size using the pooled standard deviation
  verdict: 'better' | 'worse' | 'inconclusive';
}

/**
 * M12. Did the change (new rules file, new prompt...) really help? One run proves nothing: agents are random.
 *  - delta = mean(treatment) - mean(baseline)
 *  - pooled sd = sqrt(((n1-1)*s1² + (n2-1)*s2²) / (n1+n2-2)); d = delta / pooled sd
 *  - pooled sd = 0 (scores identical inside each group): d is 0 if delta is 0, Infinity if delta > 0, -Infinity if delta < 0
 *  - fewer than 3 runs in EITHER group => verdict 'inconclusive' (d is still computed)
 *  - otherwise d >= 0.5 => 'better', d <= -0.5 => 'worse', else 'inconclusive'
 */
export function compareConditions(baseline: number[], treatment: number[]): Comparison {
  void baseline;
  void treatment;
  return todo('M12', 'implement compareConditions');
}
