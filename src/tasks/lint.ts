import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { parseRules, RuleError } from '../rules/rules';
import { parseSpec, validateSpec } from '../spec/spec';
import type { TaskConfig } from '../types';

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function listFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await listFiles(full)));
    else out.push(full);
  }
  return out;
}

/** Reads and validates `task.json`. Throws an Error with the problems when it is not valid. */
export function parseTaskConfig(json: unknown): TaskConfig {
  const t = (typeof json === 'object' && json !== null ? json : {}) as Record<string, unknown>;
  const problems: string[] = [];
  if (typeof t.id !== 'string' || !/^[a-z0-9-]+$/.test(t.id)) problems.push('id must be lowercase letters, digits and dashes');
  if (typeof t.title !== 'string' || !t.title.trim()) problems.push('title is required');
  if (typeof t.prompt !== 'string' || t.prompt.trim().length < 20) problems.push('prompt must have at least 20 characters');
  for (const key of ['allowed', 'protected'] as const) {
    const v = t[key];
    if (!Array.isArray(v) || v.length === 0 || !v.every((x) => typeof x === 'string')) problems.push(`${key} must be a non-empty array of globs`);
  }
  if (problems.length > 0) throw new Error(problems.join('; '));
  return t as unknown as TaskConfig;
}

/**
 * Checks that a task folder is a fair, complete benchmark. Returns the list of problems (empty = ok).
 * Folder layout:  task.json  SPEC.md  RULES.md  starter/  acceptance/  golden/  mutants/<name>/
 *  - task.json valid (see parseTaskConfig) and its `id` equals the folder name
 *  - SPEC.md parses, validates, and has no problems
 *  - RULES.md parses
 *  - starter/ has a tsconfig.json; acceptance/ has at least one test file
 *  - every MUST requirement has at least one acceptance test that mentions its tag, e.g. "[R3]"
 *  - acceptance tests mention no tag that is not in the spec
 *  - golden/ is not empty and mutants/ has at least 2 folders
 */
export async function lintTask(taskDir: string): Promise<string[]> {
  const problems: string[] = [];
  const folderName = taskDir.replace(/\/+$/, '').split('/').pop();

  try {
    const config = parseTaskConfig(JSON.parse(await readFile(join(taskDir, 'task.json'), 'utf8')));
    if (config.id !== folderName) problems.push(`task.json id "${config.id}" must equal the folder name "${folderName}"`);
  } catch (error) {
    problems.push(`task.json: ${(error as Error).message}`);
  }

  let requirements: ReturnType<typeof parseSpec> = [];
  try {
    requirements = parseSpec(await readFile(join(taskDir, 'SPEC.md'), 'utf8'));
    problems.push(...validateSpec(requirements).map((p) => `SPEC.md: ${p}`));
  } catch {
    problems.push('SPEC.md is missing');
  }

  try {
    parseRules(await readFile(join(taskDir, 'RULES.md'), 'utf8'));
  } catch (error) {
    problems.push(error instanceof RuleError ? `RULES.md: ${error.message}` : 'RULES.md is missing');
  }

  if (!(await exists(join(taskDir, 'starter', 'tsconfig.json')))) problems.push('starter/tsconfig.json is missing');

  if (!(await exists(join(taskDir, 'acceptance')))) {
    problems.push('acceptance/ is missing');
  } else {
    const files = (await listFiles(join(taskDir, 'acceptance'))).filter((f) => /\.test\.[cm]?[jt]s$/.test(f));
    if (files.length === 0) problems.push('acceptance/ has no test files');
    const text = (await Promise.all(files.map((f) => readFile(f, 'utf8')))).join('\n');
    const tags = new Set([...text.matchAll(/\[(R\d+)\]/g)].map((m) => m[1] as string));
    const ids = new Set(requirements.map((r) => r.id));
    for (const r of requirements) {
      if (r.level === 'MUST' && !tags.has(r.id)) problems.push(`MUST requirement ${r.id} has no acceptance test tagged [${r.id}]`);
    }
    for (const tag of tags) if (!ids.has(tag)) problems.push(`acceptance tests mention [${tag}], which is not in SPEC.md`);
  }

  if (!(await exists(join(taskDir, 'golden'))) || (await listFiles(join(taskDir, 'golden'))).length === 0) {
    problems.push('golden/ is missing or empty');
  }
  const mutantsDir = join(taskDir, 'mutants');
  const mutants = (await exists(mutantsDir)) ? (await readdir(mutantsDir, { withFileTypes: true })).filter((e) => e.isDirectory()) : [];
  if (mutants.length < 2) problems.push(`mutants/ needs at least 2 folders (found ${mutants.length})`);

  return problems;
}
