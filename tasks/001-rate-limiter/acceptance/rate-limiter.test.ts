import { describe, expect, it } from 'vitest';
import { createRateLimiter } from '../src/index';

function clock(start = 1_000) {
  let t = start;
  return { now: () => t, advance: (ms: number) => void (t += ms) };
}

describe('rate limiter', () => {
  it('[R1] check returns allowed, remaining and resetAt', () => {
    const c = clock();
    const limiter = createRateLimiter({ limit: 2, windowMs: 1_000, now: c.now });
    const result = limiter.check('a');
    expect(Object.keys(result).sort()).toEqual(['allowed', 'remaining', 'resetAt']);
    expect(typeof result.allowed).toBe('boolean');
  });

  it('[R1] uses Date.now when now is not given', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 });
    const before = Date.now();
    const { resetAt } = limiter.check('a');
    expect(resetAt).toBeGreaterThanOrEqual(before + 60_000);
  });

  it('[R2] allows exactly limit calls and blocks the next ones', () => {
    const c = clock();
    const limiter = createRateLimiter({ limit: 3, windowMs: 1_000, now: c.now });
    expect([1, 2, 3].map(() => limiter.check('a').allowed)).toEqual([true, true, true]);
    expect(limiter.check('a').allowed).toBe(false);
    expect(limiter.check('a').allowed).toBe(false);
  });

  it('[R3] keys do not affect each other', () => {
    const c = clock();
    const limiter = createRateLimiter({ limit: 1, windowMs: 1_000, now: c.now });
    expect(limiter.check('a').allowed).toBe(true);
    expect(limiter.check('a').allowed).toBe(false);
    expect(limiter.check('b').allowed).toBe(true);
  });

  it('[R4] a new window starts after windowMs', () => {
    const c = clock();
    const limiter = createRateLimiter({ limit: 1, windowMs: 1_000, now: c.now });
    expect(limiter.check('a').allowed).toBe(true);
    c.advance(999);
    expect(limiter.check('a').allowed).toBe(false);
    c.advance(1);
    expect(limiter.check('a').allowed).toBe(true);
  });

  it('[R4] the window is fixed from the first call, not extended by later calls', () => {
    const c = clock(0);
    const limiter = createRateLimiter({ limit: 2, windowMs: 1_000, now: c.now });
    limiter.check('a');
    c.advance(600);
    limiter.check('a');
    c.advance(400); // t = 1000, the first window is over
    expect(limiter.check('a').allowed).toBe(true);
  });

  it('[R5] remaining counts down and never goes below zero', () => {
    const c = clock();
    const limiter = createRateLimiter({ limit: 2, windowMs: 1_000, now: c.now });
    expect(limiter.check('a').remaining).toBe(1);
    expect(limiter.check('a').remaining).toBe(0);
    expect(limiter.check('a').remaining).toBe(0);
  });

  it('[R5] resetAt is the end of the current window', () => {
    const c = clock(5_000);
    const limiter = createRateLimiter({ limit: 1, windowMs: 1_000, now: c.now });
    expect(limiter.check('a').resetAt).toBe(6_000);
    c.advance(300);
    expect(limiter.check('a').resetAt).toBe(6_000);
  });

  it('[R6] rejects an invalid limit with a RangeError', () => {
    for (const limit of [0, -1, 1.5, Number.NaN]) {
      expect(() => createRateLimiter({ limit, windowMs: 1_000 })).toThrow(RangeError);
    }
  });

  it('[R6] rejects an invalid windowMs with a RangeError', () => {
    for (const windowMs of [0, -10, Number.NaN]) {
      expect(() => createRateLimiter({ limit: 1, windowMs })).toThrow(RangeError);
    }
  });

  it('[R7] reset forgets a key', () => {
    const c = clock();
    const limiter = createRateLimiter({ limit: 1, windowMs: 1_000, now: c.now });
    limiter.check('a');
    expect(limiter.check('a').allowed).toBe(false);
    limiter.reset?.('a');
    expect(limiter.check('a').allowed).toBe(true);
  });
});
