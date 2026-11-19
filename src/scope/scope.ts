import type { FileChange, ScopePolicy, ScopeReport } from '../types';
import { todo } from '../todo';

/**
 * M05. Did the agent stay inside its lane?
 *  - `protectedTouched`: any change (added, modified OR deleted) to a path matching `policy.protected`.
 *    This has PRIORITY: such a path is never listed as out of scope.
 *  - `outOfScope`: changes to paths that are neither protected nor allowed (`policy.allowed`).
 *  - `tooManyFiles`: more changed files than `maxFilesChanged` (when set). Exactly the limit is fine.
 *  - `ok`: none of the above.
 * Both lists are sorted alphabetically. Use `matchesAny` from rules/glob (module 04).
 */
export function checkScope(changes: FileChange[], policy: ScopePolicy): ScopeReport {
  void changes;
  void policy;
  return todo('M05', 'implement checkScope');
}
