import type { Rule, Violation } from '../types';
import { matchesAny, matchesGlob } from './glob';

const IMPORT_RE =
  /(?:import|export)\s+(?:[^'"\n]*?\s+from\s+)?['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)|require\(\s*['"]([^'"]+)['"]\s*\)/g;

function lineOf(text: string, index: number): number {
  return text.slice(0, index).split('\n').length;
}

/**
 * Applies the rules to a set of files ({ "src/a.ts": "content" }) and returns every violation.
 *  - forbidden-pattern: a line in a file matching `paths` matches `pattern`
 *  - required-file: the exact path is missing from `files`
 *  - import-boundary: a file matching `from` imports a specifier matching `disallow`
 *    (static import, `export ... from`, dynamic `import()` and `require()`)
 */
export function checkRules(rules: Rule[], files: Record<string, string>): Violation[] {
  const violations: Violation[] = [];

  for (const rule of rules) {
    switch (rule.kind) {
      case 'forbidden-pattern': {
        const pattern = new RegExp(rule.pattern);
        for (const [path, content] of Object.entries(files)) {
          if (!matchesAny(path, rule.paths)) continue;
          content.split('\n').forEach((text, i) => {
            if (pattern.test(text)) violations.push({ ruleId: rule.id, message: rule.message, path, line: i + 1 });
          });
        }
        break;
      }
      case 'required-file': {
        if (!(rule.path in files)) violations.push({ ruleId: rule.id, message: rule.message, path: rule.path });
        break;
      }
      case 'import-boundary': {
        const disallow = new RegExp(rule.disallow);
        for (const [path, content] of Object.entries(files)) {
          if (!matchesGlob(path, rule.from)) continue;
          for (const match of content.matchAll(IMPORT_RE)) {
            const specifier = match[1] ?? match[2] ?? match[3] ?? '';
            if (disallow.test(specifier)) {
              violations.push({ ruleId: rule.id, message: rule.message, path, line: lineOf(content, match.index ?? 0) });
            }
          }
        }
        break;
      }
    }
  }
  return violations;
}
