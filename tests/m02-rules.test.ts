import { describe, expect, it } from 'vitest';
import { parseRules, RuleError } from '../src/rules/rules';

const wrap = (json: string) => `# Rules\n\nSome text.\n\n\`\`\`json\n${json}\n\`\`\`\n`;

const GOOD = wrap(
  JSON.stringify([
    { id: 'RULE-001', kind: 'forbidden-pattern', pattern: 'console\\.log', paths: ['src/**'], message: 'no console' },
    { id: 'RULE-002', kind: 'required-file', path: 'README.md', message: 'need readme' },
    { id: 'RULE-003', kind: 'import-boundary', from: 'src/domain/**', disallow: '^node:', message: 'pure domain' },
  ]),
);

function issuesOf(markdown: string): string[] {
  try {
    parseRules(markdown);
  } catch (error) {
    expect(error).toBeInstanceOf(RuleError);
    return (error as RuleError).issues;
  }
  throw new Error('expected parseRules to throw');
}

describe('M02 parseRules', () => {
  it('reads the three kinds of rules', () => {
    const rules = parseRules(GOOD);
    expect(rules.map((r) => r.kind)).toEqual(['forbidden-pattern', 'required-file', 'import-boundary']);
    expect(rules[0]).toMatchObject({ id: 'RULE-001', pattern: 'console\\.log', paths: ['src/**'] });
  });

  it('uses only the first json block', () => {
    const doc = GOOD + '\n```json\n[{"broken": true}]\n```\n';
    expect(parseRules(doc)).toHaveLength(3);
  });

  it('fails when there is no json block', () => {
    expect(issuesOf('# no rules here')[0]).toMatch(/no ```json block/);
  });

  it('fails with a clear message on invalid JSON', () => {
    expect(issuesOf(wrap('[ {oops} ]'))[0]).toMatch(/^invalid JSON/);
  });

  it('requires an array', () => {
    expect(issuesOf(wrap('{"id":"RULE-001"}'))).toEqual(['the JSON block must be an array of rules']);
  });

  it('rejects unknown kinds', () => {
    const issues = issuesOf(wrap(JSON.stringify([{ id: 'RULE-001', kind: 'magic', message: 'x' }])));
    expect(issues).toEqual(['rule #1: unknown kind "magic"']);
  });

  it('rejects bad ids and duplicate ids', () => {
    const issues = issuesOf(
      wrap(
        JSON.stringify([
          { id: 'R1', kind: 'required-file', path: 'a', message: 'x' },
          { id: 'RULE-001', kind: 'required-file', path: 'a', message: 'x' },
          { id: 'RULE-001', kind: 'required-file', path: 'b', message: 'x' },
        ]),
      ),
    );
    expect(issues).toEqual(['rule #1: id must look like RULE-001', 'rule #3: duplicate id RULE-001']);
  });

  it('rejects invalid regular expressions', () => {
    const issues = issuesOf(
      wrap(JSON.stringify([{ id: 'RULE-001', kind: 'forbidden-pattern', pattern: '([', paths: ['src/**'], message: 'x' }])),
    );
    expect(issues).toEqual(['rule #1: pattern must be a valid regular expression']);
  });

  it('rejects empty or missing paths and messages', () => {
    const issues = issuesOf(wrap(JSON.stringify([{ id: 'RULE-001', kind: 'forbidden-pattern', pattern: 'x', paths: [] }])));
    expect(issues).toContain('rule #1: paths must be a non-empty array of globs');
    expect(issues).toContain('rule #1: message is required');
  });

  it('reports the problems of every rule at once', () => {
    const issues = issuesOf(wrap(JSON.stringify([{ kind: 'required-file' }, 42, { id: 'RULE-002', kind: 'import-boundary' }])));
    expect(issues.length).toBeGreaterThanOrEqual(5);
    expect(issues).toContain('rule #2: must be an object');
  });
});
