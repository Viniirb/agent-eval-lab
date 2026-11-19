import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cp, mkdir, readdir, readFile, rm, symlink } from 'node:fs/promises';
import { join, relative } from 'node:path';
import type { CommandResult, FileChange } from '../types';

export interface PrepareOptions {
  starterDir: string;
  acceptanceDir?: string; // copied to <target>/acceptance
  targetDir: string;
  nodeModulesFrom?: string; // symlinked to <target>/node_modules so the task can run vitest and tsc
}

/** Creates a fresh, isolated working copy of a task for ONE agent run. */
export async function prepareWorkdir(options: PrepareOptions): Promise<void> {
  await rm(options.targetDir, { recursive: true, force: true });
  await mkdir(options.targetDir, { recursive: true });
  await cp(options.starterDir, options.targetDir, { recursive: true });
  if (options.acceptanceDir) await cp(options.acceptanceDir, join(options.targetDir, 'acceptance'), { recursive: true });
  if (options.nodeModulesFrom) await symlink(options.nodeModulesFrom, join(options.targetDir, 'node_modules'), 'dir');
}

const IGNORED = new Set(['node_modules', '.git']);

/** Maps every file (relative path with "/") to the SHA-256 of its content. Skips node_modules and .git. */
export async function snapshot(dir: string): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  async function walk(current: string): Promise<void> {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      if (IGNORED.has(entry.name)) continue;
      const full = join(current, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.isFile()) {
        const hash = createHash('sha256').update(await readFile(full)).digest('hex');
        result[relative(dir, full).split('\\').join('/')] = hash;
      }
    }
  }
  await walk(dir);
  return result;
}

/** What changed between two snapshots: added, modified (hash differs) and deleted files, sorted by path. */
export function diffSnapshots(before: Record<string, string>, after: Record<string, string>): FileChange[] {
  const changes: FileChange[] = [];
  for (const path of Object.keys(after)) {
    if (!(path in before)) changes.push({ path, kind: 'added' });
    else if (before[path] !== after[path]) changes.push({ path, kind: 'modified' });
  }
  for (const path of Object.keys(before)) {
    if (!(path in after)) changes.push({ path, kind: 'deleted' });
  }
  return changes.sort((a, b) => a.path.localeCompare(b.path));
}

export interface RunOptions {
  cwd?: string;
  env?: Record<string, string>;
  timeoutMs?: number;
}

/**
 * Runs a command WITHOUT a shell (arguments are never parsed by sh, so prompts cannot inject commands).
 * Never rejects: failures come back in the result. On timeout the process is killed and `timedOut` is true.
 */
export function runCommand(command: string, args: string[], options: RunOptions = {}): Promise<CommandResult> {
  return new Promise((resolve) => {
    const started = Date.now();
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let settled = false;
    const finish = (code: number) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ code, stdout, stderr, timedOut, durationMs: Date.now() - started });
    };

    const child = spawn(command, args, { cwd: options.cwd, env: { ...process.env, ...options.env }, shell: false });
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, options.timeoutMs ?? 120_000);

    child.stdout.on('data', (chunk) => (stdout += chunk));
    child.stderr.on('data', (chunk) => (stderr += chunk));
    child.on('error', (error) => {
      stderr += String(error);
      finish(-1);
    });
    child.on('close', (code) => finish(code ?? -1));
  });
}
