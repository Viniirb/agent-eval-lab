import { describe, expect, it } from 'vitest';
import { extractTags, requirementCoverage } from '../src/acceptance/coverage';
import type { Requirement, TestResult } from '../src/types';

const reqs: Requirement[] = [
  { id: 'R1', level: 'MUST', text: 'a' },
  { id: 'R2', level: 'SHOULD', text: 'b' },
  { id: 'R3', level: 'MAY', text: 'c' },
];

const t = (title: string, status: TestResult['status']): TestResult => ({ title, status });

describe('M03 extractTags', () => {
  it('finds every tag once', () => {
    expect(extractTags('[R1] works [R2] and [R1] again')).toEqual(['R1', 'R2']);
  });

  it('ignores text that is not a tag', () => {
    expect(extractTags('R1 works, (R2) too, [x] and [R] and [1]')).toEqual([]);
  });
});

describe('M03 requirementCoverage', () => {
  it('a requirement passes when all of its tagged tests pass', () => {
    const c = requirementCoverage(reqs, [t('[R1] a', 'passed'), t('[R1] b', 'passed')]);
    expect(c.perRequirement.R1).toEqual({ status: 'passed', total: 2, passed: 2 });
  });

  it('one failing test fails the requirement', () => {
    const c = requirementCoverage(reqs, [t('[R1] a', 'passed'), t('[R1] b', 'failed')]);
    expect(c.perRequirement.R1).toEqual({ status: 'failed', total: 2, passed: 1 });
  });

  it('skipped tests count as not passed', () => {
    const c = requirementCoverage(reqs, [t('[R1] a', 'skipped')]);
    expect(c.perRequirement.R1?.status).toBe('failed');
  });

  it('a requirement without tests is untested', () => {
    const c = requirementCoverage(reqs, [t('[R1] a', 'passed')]);
    expect(c.perRequirement.R2).toEqual({ status: 'untested', total: 0, passed: 0 });
  });

  it('one test can cover several requirements', () => {
    const c = requirementCoverage(reqs, [t('[R1][R2] both', 'passed')]);
    expect(c.perRequirement.R1?.status).toBe('passed');
    expect(c.perRequirement.R2?.status).toBe('passed');
  });

  it('ignores tags that are not in the spec', () => {
    const c = requirementCoverage(reqs, [t('[R9] ghost', 'passed')]);
    expect(Object.keys(c.perRequirement)).toEqual(['R1', 'R2', 'R3']);
  });

  it('weights MUST 3, SHOULD 2, MAY 1', () => {
    const all = requirementCoverage(reqs, [t('[R1]', 'passed'), t('[R2]', 'passed'), t('[R3]', 'passed')]);
    expect(all.weighted).toBe(1);
    const onlyMust = requirementCoverage(reqs, [t('[R1]', 'passed')]);
    expect(onlyMust.weighted).toBeCloseTo(3 / 6);
    const noneMay = requirementCoverage(reqs, [t('[R1]', 'passed'), t('[R2]', 'passed')]);
    expect(noneMay.weighted).toBeCloseTo(5 / 6);
  });

  it('no tests and no requirements give zero, never NaN', () => {
    expect(requirementCoverage(reqs, []).weighted).toBe(0);
    expect(requirementCoverage([], []).weighted).toBe(0);
  });
});
