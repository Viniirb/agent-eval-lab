# Fixed-window rate limiter

A tiny library with one entry point: `createRateLimiter(options)` exported from `src/index.ts`.

## Requirements

- **R1 [MUST]** `createRateLimiter({ limit, windowMs, now })` returns an object with a method `check(key: string)`
  that returns `{ allowed: boolean, remaining: number, resetAt: number }`. `now` is an optional function that
  returns the current time in milliseconds (default: `Date.now`).
- **R2 [MUST]** For each key, the first `limit` calls inside a window return `allowed: true`.
  The next calls inside the same window return `allowed: false`.
- **R3 [MUST]** Keys are independent: using up the limit of one key never affects another key.
- **R4 [MUST]** A window starts at the first call of a key and lasts `windowMs`. When the window has ended
  (time >= start + windowMs), the next call starts a new window and is allowed.
- **R5 [SHOULD]** `remaining` is how many calls are still allowed in the current window after this call,
  and it is never negative. `resetAt` is the time (ms) when the current window ends.
- **R6 [MUST]** `createRateLimiter` throws a `RangeError` when `limit` is not a positive integer or when
  `windowMs` is not a positive number.
- **R7 [MAY]** The returned object also has a method `reset(key: string)` that forgets everything about that key.
