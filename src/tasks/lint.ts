import type { TaskConfig } from '../types';
import { todo } from '../todo';

/**
 * M11. Reads and validates the content of `task.json`. Throws an Error whose message joins ALL problems with "; ":
 *  - `id must be lowercase letters, digits and dashes`   (/^[a-z0-9-]+$/)
 *  - `title is required`
 *  - `prompt must have at least 20 characters`
 *  - `allowed must be a non-empty array of globs`  and  `protected must be a non-empty array of globs`
 */
export function parseTaskConfig(json: unknown): TaskConfig {
  void json;
  return todo('M11', 'implement parseTaskConfig');
}

/**
 * M11. Checks that a task folder is a fair, complete benchmark. Returns the list of problems (empty = ok).
 * Folder layout:  task.json  SPEC.md  RULES.md  starter/  acceptance/  golden/  mutants/<name>/
 * Problems to report, with these exact messages:
 *  - task.json: `task.json: <error message>` (missing or invalid) and
 *    `task.json id "x" must equal the folder name "y"`
 *  - `SPEC.md is missing`, or each problem of `validateSpec` prefixed with `SPEC.md: `
 *  - `RULES.md is missing`, or `RULES.md: <RuleError message>`
 *  - 'starter/tsconfig.json is missing'
 *  - 'acceptance/ is missing' or 'acceptance/ has no test files' (files ending in .test.ts/.test.js)
 *  - every MUST requirement needs a test mentioning its tag: `MUST requirement R3 has no acceptance test tagged [R3]`
 *  - tags used in tests that are not in the spec: `acceptance tests mention [R9], which is not in SPEC.md`
 *  - 'golden/ is missing or empty'
 *  - `mutants/ needs at least 2 folders (found 1)`
 * Use parseSpec/validateSpec (M01), parseRules (M02) and the tag convention of M03.
 */
export async function lintTask(taskDir: string): Promise<string[]> {
  void taskDir;
  return todo('M11', 'implement lintTask');
}
