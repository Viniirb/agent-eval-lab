# Threats to this benchmark

1. **Editing the acceptance tests.** The agent changes the tests so they pass. Defense: protected paths in the task policy, plus a score cap of 40 when a protected file changes.
2. **Skipping or isolating tests.** The agent adds it.skip or describe.only. Defense: scanForCheating reports these patterns, and a skipped test counts as not passed in the coverage.
3. **Hiding errors instead of fixing them.** The agent adds @ts-ignore or eslint-disable. Defense: the typecheck score and the cheating scan.
4. **Faking success.** The agent calls process.exit(0) so the run looks green. Defense: the harness reads the test report itself and requires real test results, otherwise the score is capped at 30.
5. **Instructions hidden in task files.** A copied spec contains text that attacks the agent or invisible characters. Defense: scanForInjection runs on every task file before a run, and tasks are reviewed by a person.
