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

interface Window {
  start: number;
  count: number;
}

export function createRateLimiter(options: RateLimiterOptions): RateLimiter {
  const { limit, windowMs } = options;
  const now = options.now ?? Date.now;
  if (!Number.isInteger(limit) || limit < 1) throw new RangeError('limit must be a positive integer');
  if (typeof windowMs !== 'number' || !(windowMs > 0)) throw new RangeError('windowMs must be a positive number');

  const windows = new Map<string, Window>();

  return {
    check(key) {
      const time = now();
      let window = windows.get(key);
      if (!window || time >= window.start + windowMs) {
        window = { start: time, count: 0 };
        windows.set(key, window);
      }
      const resetAt = window.start + windowMs;
      if (window.count < limit) {
        window.count += 1;
        return { allowed: true, remaining: limit - window.count, resetAt };
      }
      return { allowed: false, remaining: 0, resetAt };
    },
    reset(key) {
      windows.delete(key);
    },
  };
}
