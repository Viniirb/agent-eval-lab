# Findings (sample, from the reference solution)

This sample shows the expected shape of the module 16 report. Replace it with your own real experiment.

## Question

Does a short rules file make an agent follow the project rules more often?

## Setup

- Agents: the deterministic fake agent with the golden solution, with a mutant, and with a rule-breaking variant.
- Tasks: 001-rate-limiter and 002-parse-duration.
- Runs: 3 per condition, same tasks, same weights (60 functional, 20 rules, 10 scope, 10 quality).

## Results

The golden solution scored 100 on both tasks in every run, so the benchmark is stable for deterministic input.
Each mutant scored below 95, which means the acceptance tests catch every bug I planted. The rule-breaking variant kept 100%
functional coverage but lost 5 points for each violated rule, so rule compliance is visible in the final score.

## What surprised me

A single failed MUST requirement only costs about 10 points, because the functional part is 60% of the total and there are
seven requirements. A weak agent can still reach a B. I may need to raise the weight of MUST requirements or add a rule that
any failed MUST caps the grade.

## Limits

Two tasks are not enough to rank real agents. The fake agent has no randomness, so the comparison tool cannot show variance yet.
The rules are simple regular expressions and miss problems like bad names.

## Method notes

I changed one variable at a time and kept the weights fixed, so any difference in score came from the solution and not from the formula. I also read the failing test names of each mutant by hand, to confirm that the failed requirement was the one I had broken on purpose.

## Next steps

Run Claude Code and Codex three times each on at least five tasks, with and without a rules file, and compare the effect size.
Add a task with a larger starter project, because small tasks favor every agent.
