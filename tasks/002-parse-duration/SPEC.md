# Duration parser

One function: `parseDuration(input: string): number` exported from `src/index.ts`. It returns milliseconds.

## Requirements

- **R1 [MUST]** A single part with a unit gives milliseconds: `"250ms"` is 250, `"45s"` is 45000,
  `"30m"` is 1800000, `"2h"` is 7200000.
- **R2 [MUST]** Parts can be combined, from larger to smaller units: `"1h30m"` is 5400000 and `"2m10s"` is 130000.
- **R3 [MUST]** Spaces between parts and around the whole text are allowed: `" 1h 30m "` is 5400000.
- **R4 [MUST]** Invalid input throws a `SyntaxError`: an empty string, a unit that does not exist (`"5x"`),
  a number without a unit (`"10"`), a unit without a number (`"h"`) or a negative number (`"-5s"`).
- **R5 [SHOULD]** Numbers can have decimals: `"1.5h"` is 5400000 and `"0.5s"` is 500.
- **R6 [SHOULD]** The unit `d` means days: `"1d"` is 86400000.
- **R7 [MAY]** `"0s"` returns 0.
