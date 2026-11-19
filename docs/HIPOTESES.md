# Hypotheses

## H1
A written spec with numbered requirements (R1, R2...) makes an agent cover more requirements than a free-text request, because each requirement becomes a checklist item the agent can verify and I can measure with a tagged acceptance test.

## H2
A short rules file with machine-checkable rules (no console output, no any, no dependencies) reduces rule violations, but only when the agent reads it at the start. I will measure the number of distinct violated rules with and without the file, over at least three runs.

## H3
Agents sometimes touch files they should not touch, for example the acceptance tests, to get a green result. A scope guard with protected paths will catch this, and the score cap will make cheating pay less than doing the work honestly.
