import type { CommandResult, FileChange } from '../types';
import { todo } from '../todo';

export interface PrepareOptions {
  starterDir: string;
  acceptanceDir?: string; // copied to <target>/acceptance
  targetDir: string;
  nodeModulesFrom?: string; // symlinked to <target>/node_modules so the task can run vitest and tsc
}

/**
 * M07. Creates a fresh, isolated working copy of a task for ONE agent run:
 *  1. delete `targetDir` if it exists, then create it
 *  2. copy everything from `starterDir` into it
 *  3. when `acceptanceDir` is given, copy it to `<targetDir>/acceptance`
 *  4. when `nodeModulesFrom` is given, create a directory symlink `<targetDir>/node_modules` pointing to it
 * Hint: `node:fs/promises` has `rm`, `mkdir`, `cp` (recursive) and `symlink`.
 */
export async function prepareWorkdir(options: PrepareOptions): Promise<void> {
  void options;
  return todo('M07', 'implement prepareWorkdir');
}

/**
 * M07. Maps every file under `dir` (relative path using "/") to the SHA-256 (hex) of its content.
 * Skips the folders `node_modules` and `.git`. Hint: walk with `readdir(..., { withFileTypes: true })`, hash with `node:crypto`.
 */
export async function snapshot(dir: string): Promise<Record<string, string>> {
  void dir;
  return todo('M07', 'implement snapshot');
}

/**
 * M07. What changed between two snapshots: `added` (only in after), `modified` (hash differs) and `deleted` (only in before).
 * Sorted by path (use localeCompare).
 */
export function diffSnapshots(before: Record<string, string>, after: Record<string, string>): FileChange[] {
  void before;
  void after;
  return todo('M07', 'implement diffSnapshots');
}

export interface RunOptions {
  cwd?: string;
  env?: Record<string, string>;
  timeoutMs?: number; // default 120000
}

/**
 * M07. Runs a command WITHOUT a shell (`spawn` with `shell: false`): arguments are never parsed by sh, so a prompt full of
 * quotes, `$(...)` or `;` cannot inject commands.
 *  - capture stdout and stderr as text; `code` is the exit code
 *  - `env` is merged over `process.env`
 *  - on timeout: kill the process (SIGKILL), `timedOut = true`
 *  - NEVER rejects: if the command does not exist (spawn 'error' event) resolve with code -1 and the error text in stderr
 *  - `durationMs` is the elapsed time
 */
export function runCommand(command: string, args: string[], options: RunOptions = {}): Promise<CommandResult> {
  void command;
  void args;
  void options;
  return todo('M07', 'implement runCommand');
}
