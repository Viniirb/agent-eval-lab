import type { Rule } from '../types';
import { todo } from '../todo';

/** Given: carries EVERY problem found, so the person fixing RULES.md sees them all at once. */
export class RuleError extends Error {
  constructor(public readonly issues: string[]) {
    super(issues.join('; '));
    this.name = 'RuleError';
  }
}

/**
 * M02. Reads the rules of a RULES.md: the FIRST ```json fenced block, an array of rule objects.
 * The file is untrusted input (an agent or a person edited it), so validate EVERY field and report ALL problems.
 *
 * Throw `new RuleError([...])` with these messages (rule numbers are 1-based, in the array order):
 *  - no block:           'no ```json block found'
 *  - broken JSON:        `invalid JSON: ${error.message}`
 *  - not an array:       'the JSON block must be an array of rules'
 *  - not an object:      `rule #N: must be an object`
 *  - bad id:             `rule #N: id must look like RULE-001`      (pattern /^RULE-\d{3}$/)
 *  - repeated id:        `rule #N: duplicate id RULE-001`
 *  - no message:         `rule #N: message is required`
 *  - unknown kind:       `rule #N: unknown kind "magic"`
 *  - forbidden-pattern:  `rule #N: pattern must be a valid regular expression` and
 *                        `rule #N: paths must be a non-empty array of globs`
 *  - required-file:      `rule #N: path is required`
 *  - import-boundary:    `rule #N: from (glob) is required` and `rule #N: disallow must be a valid regular expression`
 * Return the rules only when there are no problems at all. Look at tests/m02-rules.test.ts for every case.
 */
export function parseRules(markdown: string): Rule[] {
  void markdown;
  return todo('M02', 'implement parseRules');
}
