import { runCommand } from '../sandbox/sandbox';
import type { AgentConfig, CommandResult, Invocation } from '../types';
import { todo } from '../todo';

/**
 * M08. Validates a JSON list of agents (see agents.example.json). Throws an Error whose message joins ALL problems with "; ":
 *  - not an array:       'agents must be a JSON array'
 *  - `agent #N: name is required`            (non-empty string)
 *  - `agent #N: duplicate name x`
 *  - `agent #N: command is required`
 *  - `agent #N: args must be an array of strings`
 *  - `agent #N: timeoutMs must be a positive integer`
 *  - `agent #N: env must be a map of strings`   (optional field)
 * Return the agents only when everything is valid.
 */
export function loadAgents(json: unknown): AgentConfig[] {
  void json;
  return todo('M08', 'implement loadAgents');
}

/**
 * M08. Replaces {{name}} placeholders inside each argument (many per argument is fine).
 * An unknown placeholder throws `Error('unknown placeholder {{name}}')`: a typo must not silently send "{{prompt}}" to the agent.
 * The result is an ARRAY of arguments: no quoting, no shell, no injection.
 */
export function renderArgs(args: string[], vars: Record<string, string>): string[] {
  void args;
  void vars;
  return todo('M08', 'implement renderArgs');
}

/**
 * M08. Builds the process invocation for an agent: `args` rendered with the variables `prompt` and `workdir`,
 * `cwd` = workdir, `env` = a COPY of config.env (or {}), `timeoutMs` copied.
 */
export function buildInvocation(config: AgentConfig, vars: { prompt: string; workdir: string }): Invocation {
  void config;
  void vars;
  return todo('M08', 'implement buildInvocation');
}

/** Given: anything that can run an invocation. Tests use fakes; real runs use `processRunner`. */
export type AgentRunner = (invocation: Invocation) => Promise<CommandResult>;

/** M08. Runs the invocation for real with `runCommand` (cwd, env, timeout come from the invocation). */
export const processRunner: AgentRunner = (invocation) => {
  void invocation;
  void runCommand;
  return todo('M08', 'implement processRunner');
};

/**
 * M08. A deterministic "agent" for tests and CI: copies the files of `overlayDir` (a golden solution, a mutant...) over
 * the invocation's working directory (`cwd`), keeping existing files, and returns a successful CommandResult.
 * It costs nothing and always behaves the same. Hint: `cp(overlayDir, cwd, { recursive: true, force: true })`.
 */
export function overlayAgent(overlayDir: string): AgentRunner {
  void overlayDir;
  return todo('M08', 'implement overlayAgent');
}
