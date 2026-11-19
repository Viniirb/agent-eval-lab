import { cp } from 'node:fs/promises';
import { runCommand } from '../sandbox/sandbox';
import type { AgentConfig, CommandResult, Invocation } from '../types';

/**
 * Validates a JSON list of agents (see agents.example.json). Throws an Error listing the problems:
 * name (unique, non-empty), command (non-empty), args (array of strings), timeoutMs (positive integer), env (optional string map).
 */
export function loadAgents(json: unknown): AgentConfig[] {
  const problems: string[] = [];
  if (!Array.isArray(json)) throw new Error('agents must be a JSON array');
  const names = new Set<string>();
  const agents: AgentConfig[] = [];

  json.forEach((raw, i) => {
    const where = `agent #${i + 1}`;
    const a = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
    const before = problems.length;
    if (typeof a.name !== 'string' || !a.name.trim()) problems.push(`${where}: name is required`);
    else if (names.has(a.name)) problems.push(`${where}: duplicate name ${a.name}`);
    else names.add(a.name);
    if (typeof a.command !== 'string' || !a.command.trim()) problems.push(`${where}: command is required`);
    if (!Array.isArray(a.args) || !a.args.every((x) => typeof x === 'string')) problems.push(`${where}: args must be an array of strings`);
    if (!Number.isInteger(a.timeoutMs) || (a.timeoutMs as number) <= 0) problems.push(`${where}: timeoutMs must be a positive integer`);
    if (a.env !== undefined && (typeof a.env !== 'object' || a.env === null || !Object.values(a.env).every((v) => typeof v === 'string'))) {
      problems.push(`${where}: env must be a map of strings`);
    }
    if (problems.length === before) agents.push(a as unknown as AgentConfig);
  });

  if (problems.length > 0) throw new Error(problems.join('; '));
  return agents;
}

/**
 * Replaces {{name}} placeholders inside each argument. Unknown placeholders throw an Error (a typo must not
 * silently send "{{prompt}}" to the agent). The result is an ARRAY: no quoting, no shell, no injection.
 */
export function renderArgs(args: string[], vars: Record<string, string>): string[] {
  return args.map((arg) =>
    arg.replace(/\{\{(\w+)\}\}/g, (_match, name: string) => {
      if (!(name in vars)) throw new Error(`unknown placeholder {{${name}}}`);
      return vars[name] as string;
    }),
  );
}

/** Builds the process invocation for an agent: rendered args, cwd = workdir, env merged, timeout copied. */
export function buildInvocation(config: AgentConfig, vars: { prompt: string; workdir: string }): Invocation {
  return {
    command: config.command,
    args: renderArgs(config.args, vars),
    cwd: vars.workdir,
    env: { ...(config.env ?? {}) },
    timeoutMs: config.timeoutMs,
  };
}

/** Anything that can run an invocation. Tests use fakes; real runs use `processRunner`. */
export type AgentRunner = (invocation: Invocation) => Promise<CommandResult>;

export const processRunner: AgentRunner = (invocation) =>
  runCommand(invocation.command, invocation.args, {
    cwd: invocation.cwd,
    env: invocation.env,
    timeoutMs: invocation.timeoutMs,
  });

/**
 * A deterministic "agent" for tests and CI: copies the files of `overlayDir` (a golden solution, a mutant, or nothing
 * useful) over the working directory. It costs nothing and always behaves the same.
 */
export function overlayAgent(overlayDir: string): AgentRunner {
  return async (invocation) => {
    const started = Date.now();
    await cp(overlayDir, invocation.cwd, { recursive: true, force: true });
    return { code: 0, stdout: `copied ${overlayDir}`, stderr: '', timedOut: false, durationMs: Date.now() - started };
  };
}
