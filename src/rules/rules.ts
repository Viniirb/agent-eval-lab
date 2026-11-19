import type { Rule } from '../types';

export class RuleError extends Error {
  constructor(public readonly issues: string[]) {
    super(issues.join('; '));
    this.name = 'RuleError';
  }
}

function isRegex(source: unknown): boolean {
  if (typeof source !== 'string') return false;
  try {
    new RegExp(source);
    return true;
  } catch {
    return false;
  }
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0 && value.every((v) => typeof v === 'string' && v.length > 0);
}

/**
 * Reads the rules of a RULES.md: the FIRST ```json fenced block, an array of rule objects.
 * The file is untrusted input (an agent or a person edited it), so every field is validated and ALL problems are reported at once.
 */
export function parseRules(markdown: string): Rule[] {
  const block = /```json\s*\n([\s\S]*?)\n```/.exec(markdown);
  if (!block) throw new RuleError(['no ```json block found']);

  let data: unknown;
  try {
    data = JSON.parse(block[1] as string);
  } catch (error) {
    throw new RuleError([`invalid JSON: ${(error as Error).message}`]);
  }
  if (!Array.isArray(data)) throw new RuleError(['the JSON block must be an array of rules']);

  const issues: string[] = [];
  const rules: Rule[] = [];
  const seen = new Set<string>();

  data.forEach((raw, index) => {
    const where = `rule #${index + 1}`;
    if (typeof raw !== 'object' || raw === null) {
      issues.push(`${where}: must be an object`);
      return;
    }
    const r = raw as Record<string, unknown>;
    const before = issues.length;

    if (typeof r.id !== 'string' || !/^RULE-\d{3}$/.test(r.id)) issues.push(`${where}: id must look like RULE-001`);
    else if (seen.has(r.id)) issues.push(`${where}: duplicate id ${r.id}`);
    else seen.add(r.id);

    if (typeof r.message !== 'string' || !r.message.trim()) issues.push(`${where}: message is required`);

    switch (r.kind) {
      case 'forbidden-pattern':
        if (!isRegex(r.pattern)) issues.push(`${where}: pattern must be a valid regular expression`);
        if (!isStringArray(r.paths)) issues.push(`${where}: paths must be a non-empty array of globs`);
        break;
      case 'required-file':
        if (typeof r.path !== 'string' || !r.path) issues.push(`${where}: path is required`);
        break;
      case 'import-boundary':
        if (typeof r.from !== 'string' || !r.from) issues.push(`${where}: from (glob) is required`);
        if (!isRegex(r.disallow)) issues.push(`${where}: disallow must be a valid regular expression`);
        break;
      default:
        issues.push(`${where}: unknown kind "${String(r.kind)}"`);
    }

    if (issues.length === before) rules.push(r as unknown as Rule);
  });

  if (issues.length > 0) throw new RuleError(issues);
  return rules;
}
