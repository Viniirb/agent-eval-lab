export interface RateLimiterOptions {
  limit: number;
  windowMs: number;
  now?: () => number;
}

export interface CheckResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export interface RateLimiter {
  check(key: string): CheckResult;
  reset?(key: string): void;
}

export function createRateLimiter(_options: RateLimiterOptions): RateLimiter {
  throw new Error('not implemented');
}
