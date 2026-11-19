import { cp, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { overlayAgent } from '../src/agents/adapters';
import { countTypeErrors, listTasks, parseVitestJson, runBenchmark } from '../src/pipeline/pipeline';
import type { AgentConfig } from '../src/types';

const ROOT = join(__dirname, '..');
const TASK = join(ROOT, 'tasks', '001-rate-limiter');
const agent: AgentConfig = { name: 'fake', command: 'true', args: [], timeoutMs: 5000 };

describe('M15 parseVitestJson', () => {
  it('maps vitest statuses and uses fullName', () => {
    const report = {
      testResults: [
        {
          assertionResults: [
            { fullName: 'rate limiter [R1] ok', title: '[R1] ok', status: 'passed' },
            { fullName: 'rate limiter [R2] bad', title: '[R2] bad', status: 'failed' },
            { fullName: 'rate limiter [R3] later', title: '[R3] later', status: 'pending' },
            { title: '[R4] only title', status: 'todo' },
          ],
        },
        { assertionResults: [{ fullName: 'other [R5]', status: 'passed' }] },
      ],
    };
    expect(parseVitestJson(report)).toEqual([
      { title: 'rate limiter [R1] ok', status: 'passed' },
      { title: 'rate limiter [R2] bad', status: 'failed' },
      { title: 'rate limiter [R3] later', status: 'skipped' },
      { title: '[R4] only title', status: 'skipped' },
      { title: 'other [R5]', status: 'passed' },
    ]);
  });

  it('rejects things that are not a vitest report', () => {
    expect(() => parseVitestJson({})).toThrow('not a vitest JSON report');
    expect(() => parseVitestJson(null)).toThrow();
  });
});

describe('M15 countTypeErrors', () => {
  it('counts lines with error TSxxxx', () => {
    const out = "src/a.ts(1,1): error TS2322: Type 'x'.\nsrc/b.ts(2,2): error TS7006: Param.\nFound 2 errors.\n";
    expect(countTypeErrors(out)).toBe(2);
    expect(countTypeErrors('')).toBe(0);
  });
});

describe('M15 runBenchmark (real vitest and tsc in an isolated copy)', () => {
  let work: string;
  beforeAll(async () => {
    work = await mkdtemp(join(tmpdir(), 'bench-'));
  });
  afterAll(async () => {
    await rm(work, { recursive: true, force: true });
  });

  const run = (overlay: string | null, name: string) =>
    runBenchmark({
      taskDir: TASK,
      agent: { ...agent, name },
      runner: overlay ? overlayAgent(overlay) : async () => ({ code: 0, stdout: '', stderr: '', timedOut: false, durationMs: 0 }),
      workRoot: work,
      nodeModulesFrom: join(ROOT, 'node_modules'),
    });

  it('the golden solution scores at least 95', async () => {
    const r = await run(join(TASK, 'golden'), 'golden');
    expect(r.testsRan).toBe(true);
    expect(r.card.total).toBeGreaterThanOrEqual(95);
    expect(r.violations).toEqual([]);
    expect(r.scope.ok).toBe(true);
    expect(r.coverage.weighted).toBe(1);
  });

  it('an agent that does nothing scores low on functionality', async () => {
    const r = await run(null, 'lazy');
    expect(r.changes).toEqual([]);
    expect(r.card.breakdown.functional).toBe(0);
    expect(r.card.total).toBeLessThan(60);
    expect(r.violations.map((v) => v.ruleId)).toEqual(['RULE-003']);
  });

  it('every mutant scores below the golden zone', async () => {
    for (const name of ['m1-shared-counter', 'm2-never-resets', 'm3-off-by-one']) {
      const r = await run(join(TASK, 'mutants', name), name);
      expect(r.card.total, name).toBeLessThan(95);
      expect(r.coverage.weighted, name).toBeLessThan(1);
    }
  });

  it('an agent that edits the acceptance tests is capped at 40', async () => {
    const tamper = await mkdtemp(join(tmpdir(), 'tamper-'));
    await cp(join(TASK, 'golden'), tamper, { recursive: true });
    await cp(join(TASK, 'acceptance'), join(tamper, 'acceptance'), { recursive: true });
    await writeFile(join(tamper, 'acceptance', 'rate-limiter.test.ts'), "import { it } from 'vitest';\nit('free pass [R1] [R2] [R3] [R4] [R5] [R6] [R7]', () => {});\n");
    const r = await run(tamper, 'tamper');
    await rm(tamper, { recursive: true, force: true });
    expect(r.scope.protectedTouched).toEqual(['acceptance/rate-limiter.test.ts']);
    expect(r.coverage.weighted).toBe(1); // the cheat even gets 100% functional...
    expect(r.card.total).toBe(40); // ...but the cap stops it
    expect(r.card.capped).toBe('protected files were modified');
  });

  it('rule violations lower the score without breaking behavior', async () => {
    const dirty = await mkdtemp(join(tmpdir(), 'dirty-'));
    await cp(join(TASK, 'golden'), dirty, { recursive: true });
    const { readFile } = await import('node:fs/promises');
    const src = await readFile(join(dirty, 'src/index.ts'), 'utf8');
    await writeFile(join(dirty, 'src/index.ts'), src.replace('const time = now();', 'const time = now();\n      console.log(time);'));
    const r = await run(dirty, 'dirty');
    await rm(dirty, { recursive: true, force: true });
    expect(r.coverage.weighted).toBe(1);
    expect(r.violations.map((v) => v.ruleId)).toEqual(['RULE-001']);
    expect(r.card.total).toBeLessThan(100);
    expect(r.card.total).toBeGreaterThan(90);
  });
});

describe('M15 listTasks', () => {
  it('finds the task folders', async () => {
    const tasks = await listTasks(join(ROOT, 'tasks'));
    expect(tasks.map((t) => t.split('/').pop())).toContain('001-rate-limiter');
  });
});
