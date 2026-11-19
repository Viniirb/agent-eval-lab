export interface Summary {
  n: number;
  mean: number;
  stdev: number; // sample standard deviation (n - 1); 0 when n < 2
  min: number;
  max: number;
}

/** Descriptive statistics. An empty list throws RangeError. */
export function summarize(values: number[]): Summary {
  if (values.length === 0) throw new RangeError('summarize needs at least one value');
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = n < 2 ? 0 : values.reduce((a, v) => a + (v - mean) ** 2, 0) / (n - 1);
  return { n, mean, stdev: Math.sqrt(variance), min: Math.min(...values), max: Math.max(...values) };
}

export interface Comparison {
  delta: number; // mean(treatment) - mean(baseline)
  cohensD: number; // effect size using the pooled standard deviation
  verdict: 'better' | 'worse' | 'inconclusive';
}

/**
 * Did the change (new rules file, new prompt...) really help? One run proves nothing: agents are random.
 *  - fewer than 3 runs in either group => inconclusive
 *  - pooled sd = sqrt(((n1-1)s1² + (n2-1)s2²) / (n1+n2-2)); d = delta / pooled sd
 *  - pooled sd = 0 (all scores identical inside each group): d is Infinity/-Infinity/0 by the sign of delta
 *  - |d| >= 0.5 => better (d > 0) or worse (d < 0); otherwise inconclusive
 */
export function compareConditions(baseline: number[], treatment: number[]): Comparison {
  const a = summarize(baseline);
  const b = summarize(treatment);
  const delta = b.mean - a.mean;
  const pooled = Math.sqrt(((a.n - 1) * a.stdev ** 2 + (b.n - 1) * b.stdev ** 2) / (a.n + b.n - 2 || 1));
  const cohensD = pooled === 0 ? (delta === 0 ? 0 : delta > 0 ? Infinity : -Infinity) : delta / pooled;
  if (a.n < 3 || b.n < 3) return { delta, cohensD, verdict: 'inconclusive' };
  const verdict = cohensD >= 0.5 ? 'better' : cohensD <= -0.5 ? 'worse' : 'inconclusive';
  return { delta, cohensD, verdict };
}
