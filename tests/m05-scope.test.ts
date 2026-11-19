import { describe, expect, it } from 'vitest';
import { checkScope } from '../src/scope/scope';
import type { FileChange, ScopePolicy } from '../src/types';

const policy: ScopePolicy = { allowed: ['src/**', 'README.md'], protected: ['acceptance/**', 'SPEC.md'], maxFilesChanged: 3 };
const change = (path: string, kind: FileChange['kind'] = 'modified'): FileChange => ({ path, kind });

describe('M05 checkScope', () => {
  it('allowed changes are ok', () => {
    expect(checkScope([change('src/index.ts'), change('README.md', 'added')], policy)).toEqual({
      ok: true,
      outOfScope: [],
      protectedTouched: [],
      tooManyFiles: false,
    });
  });

  it('no changes is ok', () => {
    expect(checkScope([], policy).ok).toBe(true);
  });

  it('flags files outside the allowed paths', () => {
    const r = checkScope([change('package.json'), change('src/a.ts'), change('.github/ci.yml', 'added')], policy);
    expect(r.outOfScope).toEqual(['.github/ci.yml', 'package.json']);
    expect(r.ok).toBe(false);
  });

  it('protected files win over out-of-scope, for any kind of change', () => {
    const r = checkScope([change('acceptance/a.test.ts'), change('SPEC.md', 'deleted'), change('acceptance/new.test.ts', 'added')], policy);
    expect(r.protectedTouched).toEqual(['SPEC.md', 'acceptance/a.test.ts', 'acceptance/new.test.ts']);
    expect(r.outOfScope).toEqual([]);
    expect(r.ok).toBe(false);
  });

  it('flags too many changed files, with the limit itself allowed', () => {
    const three = ['src/a.ts', 'src/b.ts', 'src/c.ts'].map((p) => change(p));
    expect(checkScope(three, policy).tooManyFiles).toBe(false);
    const four = [...three, change('src/d.ts')];
    const r = checkScope(four, policy);
    expect(r.tooManyFiles).toBe(true);
    expect(r.ok).toBe(false);
  });

  it('without maxFilesChanged there is no limit', () => {
    const many = Array.from({ length: 50 }, (_, i) => change(`src/f${i}.ts`));
    expect(checkScope(many, { allowed: ['src/**'], protected: [] }).ok).toBe(true);
  });
});
