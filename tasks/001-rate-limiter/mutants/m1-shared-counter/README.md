# rate-limiter

A small fixed-window rate limiter with zero dependencies.

```ts
import { createRateLimiter } from './src/index';

const limiter = createRateLimiter({ limit: 5, windowMs: 60_000 });
const { allowed, remaining, resetAt } = limiter.check('user-42');
```

- Each key has its own window, which starts at the first call.
- After `windowMs` the next call starts a new window.
- `reset(key)` forgets a key.
