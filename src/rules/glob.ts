import { todo } from '../todo';

/**
 * M04. Converts a glob to a RegExp (paths use "/" and are relative, e.g. "src/a/b.ts"). The regexp must match the WHOLE path.
 *   *   any characters except "/"
 *   **  any characters including "/"; when written as "**" + "/" it means ZERO or more folders
 *       (so "src/" + "**" + "/*.ts" matches "src/a.ts" and "src/x/y.ts")
 *   ?   exactly one character except "/"
 * Everything else is literal (escape regex characters like . + ( ) etc).
 * Hint: walk the glob character by character and build a regex source string.
 */
export function globToRegExp(glob: string): RegExp {
  void glob;
  return todo('M04', 'implement globToRegExp');
}

/** M04. True when `path` matches `glob`. Windows separators ("\") in the path count as "/". */
export function matchesGlob(path: string, glob: string): boolean {
  void path;
  void glob;
  return todo('M04', 'implement matchesGlob');
}

/** M04. True when the path matches at least one of the globs. */
export function matchesAny(path: string, globs: string[]): boolean {
  void path;
  void globs;
  return todo('M04', 'implement matchesAny');
}
