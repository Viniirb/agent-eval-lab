import { mkdir, mkdtemp, readFile, rm, writeFile, lstat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { diffSnapshots, prepareWorkdir, runCommand, snapshot } from '../src/sandbox/sandbox';

let root: string;
beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'sandbox-'));
});
afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

async function write(base: string, path: string, content: string) {
  const full = join(base, path);
  await mkdir(join(full, '..'), { recursive: true });
  await writeFile(full, content);
}

describe('M07 prepareWorkdir', () => {
  it('copies the starter and the acceptance tests into a clean target', async () => {
    const starter = join(root, 'starter');
    const acceptance = join(root, 'acc');
    const target = join(root, 'work');
    await write(starter, 'src/index.ts', 'export {}');
    await write(acceptance, 'a.test.ts', 'test');
    await write(target, 'stale.txt', 'old run');

    await prepareWorkdir({ starterDir: starter, acceptanceDir: acceptance, targetDir: target });

    expect(await readFile(join(target, 'src/index.ts'), 'utf8')).toBe('export {}');
    expect(await readFile(join(target, 'acceptance/a.test.ts'), 'utf8')).toBe('test');
    await expect(lstat(join(target, 'stale.txt'))).rejects.toThrow();
  });

  it('links node_modules when asked', async () => {
    const starter = join(root, 'starter');
    const modules = join(root, 'modules');
    await write(starter, 'a.txt', 'a');
    await mkdir(modules);
    await prepareWorkdir({ starterDir: starter, targetDir: join(root, 'work'), nodeModulesFrom: modules });
    expect((await lstat(join(root, 'work/node_modules'))).isSymbolicLink()).toBe(true);
  });
});

describe('M07 snapshot and diffSnapshots', () => {
  it('hashes files with relative paths and skips node_modules and .git', async () => {
    await write(root, 'a.txt', 'one');
    await write(root, 'dir/b.txt', 'two');
    await write(root, 'node_modules/x/index.js', 'ignored');
    await write(root, '.git/config', 'ignored');
    const snap = await snapshot(root);
    expect(Object.keys(snap).sort()).toEqual(['a.txt', 'dir/b.txt']);
    expect(snap['a.txt']).toMatch(/^[0-9a-f]{64}$/);
  });

  it('the same content gives the same hash', async () => {
    await write(root, 'a.txt', 'same');
    await write(root, 'b.txt', 'same');
    const snap = await snapshot(root);
    expect(snap['a.txt']).toBe(snap['b.txt']);
  });

  it('detects added, modified and deleted files, sorted by path', () => {
    const before = { 'a.ts': '1', 'b.ts': '2', 'c.ts': '3' };
    const after = { 'a.ts': '1', 'b.ts': 'X', 'd.ts': '4' };
    expect(diffSnapshots(before, after)).toEqual([
      { path: 'b.ts', kind: 'modified' },
      { path: 'c.ts', kind: 'deleted' },
      { path: 'd.ts', kind: 'added' },
    ]);
  });

  it('identical snapshots have no changes', () => {
    expect(diffSnapshots({ 'a.ts': '1' }, { 'a.ts': '1' })).toEqual([]);
  });
});

describe('M07 runCommand', () => {
  it('captures output and the exit code', async () => {
    const r = await runCommand('node', ['-e', "console.log('out'); console.error('err'); process.exit(3)"]);
    expect(r.code).toBe(3);
    expect(r.stdout.trim()).toBe('out');
    expect(r.stderr.trim()).toBe('err');
    expect(r.timedOut).toBe(false);
    expect(r.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('runs in the given cwd with extra env', async () => {
    const r = await runCommand('node', ['-e', 'console.log(process.cwd() + "|" + process.env.LAB_VAR)'], {
      cwd: root,
      env: { LAB_VAR: 'yes' },
    });
    expect(r.stdout.trim().endsWith('|yes')).toBe(true);
  });

  it('kills the process on timeout', async () => {
    const r = await runCommand('node', ['-e', 'setTimeout(() => {}, 10000)'], { timeoutMs: 200 });
    expect(r.timedOut).toBe(true);
    expect(r.durationMs).toBeLessThan(5000);
  });

  it('does not use a shell: arguments are not interpreted', async () => {
    const r = await runCommand('node', ['-e', 'console.log(process.argv[1])', '$(echo hacked); echo hacked']);
    expect(r.stdout.trim()).toBe('$(echo hacked); echo hacked');
  });

  it('never rejects: a missing command comes back as a failed result', async () => {
    const r = await runCommand('this-command-does-not-exist-xyz', []);
    expect(r.code).not.toBe(0);
    expect(r.stderr.length).toBeGreaterThan(0);
  });
});
