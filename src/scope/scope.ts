import type { FileChange, ScopePolicy, ScopeReport } from '../types';
import { matchesAny } from '../rules/glob';

/**
 * Did the agent stay inside its lane?
 *  - `protectedTouched`: any change (added, modified OR deleted) to a protected path. This has priority over "out of scope".
 *  - `outOfScope`: changes to paths that are neither allowed nor protected.
 *  - `tooManyFiles`: more changed files than `maxFilesChanged` (when set).
 *  - `ok`: none of the above. Lists are sorted alphabetically.
 */
export function checkScope(changes: FileChange[], policy: ScopePolicy): ScopeReport {
  const protectedTouched: string[] = [];
  const outOfScope: string[] = [];

  for (const change of changes) {
    if (matchesAny(change.path, policy.protected)) protectedTouched.push(change.path);
    else if (!matchesAny(change.path, policy.allowed)) outOfScope.push(change.path);
  }
  protectedTouched.sort();
  outOfScope.sort();

  const tooManyFiles = policy.maxFilesChanged !== undefined && changes.length > policy.maxFilesChanged;
  return {
    ok: protectedTouched.length === 0 && outOfScope.length === 0 && !tooManyFiles,
    outOfScope,
    protectedTouched,
    tooManyFiles,
  };
}
