import type { Rule, Violation } from '../types';
import { todo } from '../todo';

/**
 * M04. Applies the rules to a set of files ({ "src/a.ts": "content" }) and returns every violation, rule by rule.
 *  - forbidden-pattern: for each file matching `paths`, each LINE that matches `pattern` is a violation
 *    { ruleId, message, path, line } (line is 1-based)
 *  - required-file: when `path` is not a key of `files`, ONE violation { ruleId, message, path } (no line)
 *  - import-boundary: for each file matching `from`, find the import specifiers and report those that match `disallow`
 *    (with path and the line where the import starts). Cover ALL of these forms:
 *        import x from 'a'     import 'a'     export * from 'a'     export { x } from 'a'
 *        await import('a')     require('a')
 * Hint: one regular expression with `matchAll` finds all specifiers; count the "\n" before `match.index` for the line.
 */
export function checkRules(rules: Rule[], files: Record<string, string>): Violation[] {
  void rules;
  void files;
  return todo('M04', 'implement checkRules');
}
