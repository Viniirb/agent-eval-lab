/**
 * Converts a glob to a RegExp (paths use "/" and are relative, e.g. "src/a/b.ts").
 *   *   any characters except "/"
 *   **  any characters including "/" (a leading "**" + "/" means zero or more folders)
 *   ?   exactly one character except "/"
 * Everything else is literal.
 */
export function globToRegExp(glob: string): RegExp {
  let source = '^';
  for (let i = 0; i < glob.length; i++) {
    const char = glob[i] as string;
    if (char === '*') {
      if (glob[i + 1] === '*') {
        i += 1;
        if (glob[i + 1] === '/') {
          i += 1;
          source += '(?:.*/)?'; // "**/" = zero or more folders
        } else {
          source += '.*';
        }
      } else {
        source += '[^/]*';
      }
    } else if (char === '?') {
      source += '[^/]';
    } else {
      source += char.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    }
  }
  return new RegExp(source + '$');
}

export function matchesGlob(path: string, glob: string): boolean {
  return globToRegExp(glob).test(path.replace(/\\/g, '/'));
}

export function matchesAny(path: string, globs: string[]): boolean {
  return globs.some((g) => matchesGlob(path, g));
}
