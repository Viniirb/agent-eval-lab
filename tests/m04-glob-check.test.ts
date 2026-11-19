import { describe, expect, it } from 'vitest';
import { checkRules } from '../src/rules/check';
import { globToRegExp, matchesAny, matchesGlob } from '../src/rules/glob';
import type { Rule } from '../src/types';

describe('M04 glob', () => {
  it('* stays inside one folder', () => {
    expect(matchesGlob('src/a.ts', 'src/*.ts')).toBe(true);
    expect(matchesGlob('src/x/a.ts', 'src/*.ts')).toBe(false);
  });

  it('** crosses folders', () => {
    expect(matchesGlob('src/a/b/c.ts', 'src/**')).toBe(true);
    expect(matchesGlob('src/a/b/c.ts', 'src/**/*.ts')).toBe(true);
  });

  it('**/ matches zero folders too', () => {
    expect(matchesGlob('src/a.ts', 'src/**/*.ts')).toBe(true);
    expect(matchesGlob('a.test.ts', '**/*.test.ts')).toBe(true);
    expect(matchesGlob('deep/er/a.test.ts', '**/*.test.ts')).toBe(true);
  });

  it('? is exactly one character', () => {
    expect(matchesGlob('a1.ts', 'a?.ts')).toBe(true);
    expect(matchesGlob('a12.ts', 'a?.ts')).toBe(false);
  });

  it('escapes regex characters and must match the whole path', () => {
    expect(matchesGlob('README.md', 'README.md')).toBe(true);
    expect(matchesGlob('READMExmd', 'README.md')).toBe(false);
    expect(matchesGlob('src/a.ts.bak', 'src/*.ts')).toBe(false);
    expect(matchesGlob('a+b.ts', 'a+b.ts')).toBe(true);
  });

  it('normalizes Windows separators and supports lists', () => {
    expect(matchesGlob('src\\a.ts', 'src/*.ts')).toBe(true);
    expect(matchesAny('x.md', ['src/**', '*.md'])).toBe(true);
    expect(matchesAny('x.js', ['src/**', '*.md'])).toBe(false);
  });

  it('globToRegExp returns a RegExp', () => {
    expect(globToRegExp('src/**')).toBeInstanceOf(RegExp);
  });
});

const rules: Rule[] = [
  { id: 'RULE-001', kind: 'forbidden-pattern', pattern: 'console\\.log', paths: ['src/**'], message: 'no console' },
  { id: 'RULE-002', kind: 'required-file', path: 'README.md', message: 'need readme' },
  { id: 'RULE-003', kind: 'import-boundary', from: 'src/domain/**', disallow: '^(node:|\\.\\./infra)', message: 'pure domain' },
];

describe('M04 checkRules', () => {
  it('a clean project has no violations', () => {
    const files = { 'README.md': '# hi', 'src/domain/a.ts': "import { x } from './b';\nexport const a = 1;", 'src/domain/b.ts': 'export const x = 1;' };
    expect(checkRules(rules, files)).toEqual([]);
  });

  it('forbidden-pattern reports every matching line with its number', () => {
    const files = { 'README.md': '', 'src/a.ts': 'ok\nconsole.log(1)\nok\nconsole.log(2)', 'test/b.ts': 'console.log(3)' };
    const v = checkRules(rules, files).filter((x) => x.ruleId === 'RULE-001');
    expect(v.map((x) => [x.path, x.line])).toEqual([
      ['src/a.ts', 2],
      ['src/a.ts', 4],
    ]);
    expect(v[0]?.message).toBe('no console');
  });

  it('required-file reports a missing file once', () => {
    const v = checkRules(rules, { 'src/a.ts': '' });
    expect(v).toEqual([{ ruleId: 'RULE-002', message: 'need readme', path: 'README.md' }]);
  });

  it('import-boundary detects static, export-from, dynamic and require imports', () => {
    const files = {
      'README.md': '',
      'src/domain/a.ts': [
        "import fs from 'node:fs';",
        "export * from '../infra/db';",
        "const m = await import('node:path');",
        "const r = require('node:os');",
        "import { ok } from './ok';",
      ].join('\n'),
    };
    const v = checkRules(rules, files).filter((x) => x.ruleId === 'RULE-003');
    expect(v.map((x) => x.line)).toEqual([1, 2, 3, 4]);
  });

  it('import-boundary only checks files matched by from', () => {
    const files = { 'README.md': '', 'src/app/a.ts': "import fs from 'node:fs';" };
    expect(checkRules(rules, files)).toEqual([]);
  });

  it('handles side-effect imports', () => {
    const files = { 'README.md': '', 'src/domain/a.ts': "import 'node:fs';" };
    expect(checkRules(rules, files).map((v) => v.ruleId)).toEqual(['RULE-003']);
  });
});
