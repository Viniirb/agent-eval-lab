import { cp, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { lintTask, parseTaskConfig } from '../src/tasks/lint';

const TASKS = join(__dirname, '..', 'tasks');

describe('M11 parseTaskConfig', () => {
  const ok = { id: 'my-task', title: 'T', prompt: 'x'.repeat(30), allowed: ['src/**'], protected: ['acceptance/**'] };

  it('accepts a valid config', () => {
    expect(parseTaskConfig(ok)).toEqual(ok);
  });

  it('reports every problem', () => {
    expect(() => parseTaskConfig({ id: 'Bad Id', title: '', prompt: 'short', allowed: [], protected: 'x' })).toThrow(
      /id must be.*title is required.*prompt must have.*allowed must.*protected must/,
    );
  });
});

describe('M11 lintTask on real tasks', () => {
  it('the shipped task 001 is valid', async () => {
    expect(await lintTask(join(TASKS, '001-rate-limiter'))).toEqual([]);
  });
});

describe('M11 lintTask problems', () => {
  let dir: string;
  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'lint-'));
    await cp(join(TASKS, '001-rate-limiter'), join(dir, '001-rate-limiter'), { recursive: true });
  });
  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });
  const task = () => join(dir, '001-rate-limiter');

  it('reports a missing SPEC.md', async () => {
    await rm(join(task(), 'SPEC.md'));
    expect(await lintTask(task())).toContain('SPEC.md is missing');
  });

  it('reports a MUST requirement without an acceptance test', async () => {
    await writeFile(join(task(), 'SPEC.md'), '- **R1 [MUST]** a\n- **R2 [MUST]** b\n- **R99 [MUST]** never tested\n');
    const problems = await lintTask(task());
    expect(problems).toContain('MUST requirement R99 has no acceptance test tagged [R99]');
  });

  it('reports acceptance tags that are not in the spec', async () => {
    await writeFile(join(task(), 'SPEC.md'), '- **R1 [MUST]** only one\n');
    const problems = await lintTask(task());
    expect(problems).toContain('acceptance tests mention [R2], which is not in SPEC.md');
  });

  it('reports invalid RULES.md', async () => {
    await writeFile(join(task(), 'RULES.md'), 'no rules');
    expect((await lintTask(task())).some((p) => p.startsWith('RULES.md:'))).toBe(true);
  });

  it('reports too few mutants and an empty golden', async () => {
    await rm(join(task(), 'mutants/m1-shared-counter'), { recursive: true });
    await rm(join(task(), 'mutants/m2-never-resets'), { recursive: true });
    await rm(join(task(), 'golden'), { recursive: true });
    const problems = await lintTask(task());
    expect(problems).toContain('mutants/ needs at least 2 folders (found 1)');
    expect(problems).toContain('golden/ is missing or empty');
  });

  it('requires the id to equal the folder name', async () => {
    await cp(task(), join(dir, 'renamed'), { recursive: true });
    expect((await lintTask(join(dir, 'renamed'))).some((p) => p.includes('must equal the folder name'))).toBe(true);
  });
});

describe('M11 your own task', () => {
  it('has at least two tasks and every task is valid', async () => {
    const names = (await readdir(TASKS, { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name).sort();
    expect(names.length, 'create tasks/002-... (see the issue of module 11)').toBeGreaterThanOrEqual(2);
    for (const name of names) {
      expect(await lintTask(join(TASKS, name)), name).toEqual([]);
    }
  });
});
