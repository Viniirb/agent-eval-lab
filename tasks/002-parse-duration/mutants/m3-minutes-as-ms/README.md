# parse-duration

`parseDuration("1h30m")` returns `5400000` (milliseconds).

Units: `d`, `h`, `m`, `s`, `ms`. Decimals are allowed (`"1.5h"`). Invalid input throws a `SyntaxError`.
