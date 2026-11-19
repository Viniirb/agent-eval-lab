import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildInvocation, loadAgents, overlayAgent, processRunner, renderArgs } from '../src/agents/adapters';
import type { AgentConfig } from '../src/types';

describe('M08 renderArgs', () => {
  it('replaces placeholders inside arguments', () => {
    expect(renderArgs(['-p', '{{prompt}}', '--dir={{workdir}}'], { prompt: 'do it', workdir: '/w' })).toEqual(['-p', 'do it', '--dir=/w']);
  });

  it('keeps special characters untouched (no shell, no escaping needed)', () => {
    const prompt = 'rm -rf / ; "quoted" $(whoami) `x` \n line2';
    expect(renderArgs(['{{prompt}}'], { prompt })).toEqual([prompt]);
  });

  it('replaces every occurrence', () => {
    expect(renderArgs(['{{a}}-{{a}}'], { a: 'x' })).toEqual(['x-x']);
  });

  it('throws on an unknown placeholder', () => {
    expect(() => renderArgs(['{{promt}}'], { prompt: 'x' })).toThrow('unknown placeholder {{promt}}');
  });

  it('leaves arguments without placeholders alone', () => {
    expect(renderArgs(['--flag', 'value'], {})).toEqual(['--flag', 'value']);
  });
});

describe('M08 buildInvocation', () => {
  const config: AgentConfig = { name: 'a', command: 'agent', args: ['-p', '{{prompt}}'], timeoutMs: 1234, env: { KEY: 'v' } };

  it('renders args, sets cwd to the workdir and copies timeout and env', () => {
    expect(buildInvocation(config, { prompt: 'hello', workdir: '/w' })).toEqual({
      command: 'agent',
      args: ['-p', 'hello'],
      cwd: '/w',
      env: { KEY: 'v' },
      timeoutMs: 1234,
    });
  });

  it('works without env', () => {
    const { env } = buildInvocation({ ...config, env: undefined }, { prompt: 'x', workdir: '/w' });
    expect(env).toEqual({});
  });

  it('does not share the env object with the config', () => {
    const inv = buildInvocation(config, { prompt: 'x', workdir: '/w' });
    inv.env.NEW = '1';
    expect(config.env).toEqual({ KEY: 'v' });
  });
});

describe('M08 loadAgents', () => {
  const ok = { name: 'claude', command: 'claude', args: ['-p', '{{prompt}}'], timeoutMs: 1000 };

  it('accepts a valid list', () => {
    expect(loadAgents([ok, { ...ok, name: 'other', env: { A: 'b' } }])).toHaveLength(2);
  });

  it('requires an array', () => {
    expect(() => loadAgents({})).toThrow('agents must be a JSON array');
  });

  it('reports every problem', () => {
    expect(() => loadAgents([{ name: '', command: '', args: 'x', timeoutMs: -1 }])).toThrow(/name is required.*command is required.*args.*timeoutMs/);
  });

  it('rejects duplicate names and bad env', () => {
    expect(() => loadAgents([ok, ok])).toThrow('duplicate name claude');
    expect(() => loadAgents([{ ...ok, env: { A: 1 } }])).toThrow('env must be a map of strings');
  });

  it('accepts the shipped example file', async () => {
    const text = await readFile(join(__dirname, '..', 'agents.example.json'), 'utf8');
    expect(loadAgents(JSON.parse(text)).length).toBeGreaterThanOrEqual(2);
  });
});

describe('M08 runners', () => {
  let root: string;
  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'agents-'));
  });
  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('processRunner runs the invocation', async () => {
    const r = await processRunner({ command: 'node', args: ['-e', 'console.log(process.argv[1])', 'hi'], cwd: root, env: {}, timeoutMs: 5000 });
    expect(r.code).toBe(0);
    expect(r.stdout.trim()).toBe('hi');
  });

  it('overlayAgent copies a folder over the working directory', async () => {
    const overlay = join(root, 'overlay');
    const work = join(root, 'work');
    await mkdir(join(overlay, 'src'), { recursive: true });
    await mkdir(work);
    await writeFile(join(overlay, 'src/index.ts'), 'solution');
    await writeFile(join(work, 'keep.txt'), 'keep');
    const result = await overlayAgent(overlay)({ command: 'x', args: [], cwd: work, env: {}, timeoutMs: 1 });
    expect(result.code).toBe(0);
    expect(await readFile(join(work, 'src/index.ts'), 'utf8')).toBe('solution');
    expect(await readFile(join(work, 'keep.txt'), 'utf8')).toBe('keep');
  });
});
