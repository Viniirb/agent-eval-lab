import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { evaluateGate, parseSummary, type RunSummary } from '../src/gate/gate';

const base: RunSummary = { meanScore: 90, runs: 3, perTask: { a: 90, b: 90 } };
const policy = { minScore: 70, maxDrop: 5, maxTaskDrop: 10, minRuns: 3 };

describe('M13 parseSummary', () => {
  it('accepts a valid summary', () => {
    expect(parseSummary(base)).toEqual(base);
  });

  it('reports every problem', () => {
    expect(() => parseSummary({ meanScore: 120, runs: 0, perTask: { a: 'x' } })).toThrow(/meanScore.*runs.*perTask/);
    expect(() => parseSummary(null)).toThrow();
  });
});

describe('M13 evaluateGate', () => {
  it('passes a healthy run', () => {
    expect(evaluateGate({ meanScore: 88, runs: 3, perTask: { a: 88, b: 88 } }, base, policy)).toEqual({ pass: true, reasons: [] });
  });

  it('works without a baseline', () => {
    expect(evaluateGate(base, undefined, policy).pass).toBe(true);
  });

  it('fails below the absolute minimum', () => {
    const r = evaluateGate({ meanScore: 60, runs: 3, perTask: {} }, undefined, policy);
    expect(r.reasons).toEqual(['mean score 60 is below the minimum 70']);
  });

  it('fails with too few runs', () => {
    expect(evaluateGate({ ...base, runs: 1 }, undefined, policy).reasons).toEqual(['only 1 runs (minimum 3)']);
  });

  it('a drop equal to the limit is allowed, a bigger one is not', () => {
    expect(evaluateGate({ meanScore: 85, runs: 3, perTask: { a: 85, b: 85 } }, base, policy).pass).toBe(true);
    const r = evaluateGate({ meanScore: 84.9, runs: 3, perTask: { a: 90, b: 90 } }, base, policy);
    expect(r.reasons).toEqual(['mean score dropped 5.1 points (limit 5)']);
  });

  it('fails when one task drops too much even if the mean is fine', () => {
    const r = evaluateGate({ meanScore: 90, runs: 3, perTask: { a: 100, b: 79 } }, base, policy);
    expect(r.reasons).toEqual(['task b dropped 11 points (limit 10)']);
  });

  it('fails when a baseline task is missing now', () => {
    expect(evaluateGate({ ...base, perTask: { a: 90 } }, base, policy).reasons).toEqual(['task b is missing from the current run']);
  });

  it('lists every reason, not just the first', () => {
    const r = evaluateGate({ meanScore: 50, runs: 1, perTask: { a: 50 } }, base, policy);
    expect(r.pass).toBe(false);
    expect(r.reasons.length).toBe(5);
  });
});

describe('M13 your benchmark workflow', () => {
  const file = join(__dirname, '..', '.github', 'workflows', 'benchmark.yml');

  it('exists: .github/workflows/benchmark.yml (see the issue of module 13)', () => {
    expect(existsSync(file)).toBe(true);
  });

  it('runs only on demand, uses secrets, limits permissions and uploads results', () => {
    const text = readFileSync(file, 'utf8');
    expect(text).toContain('workflow_dispatch');
    expect(text).toMatch(/secrets\./);
    expect(text).toMatch(/permissions:/);
    expect(text).toMatch(/upload-artifact/);
  });

  it('is safe: no pull_request_target and no secret printed', () => {
    const text = readFileSync(file, 'utf8');
    expect(text).not.toContain('pull_request_target');
    expect(text).not.toMatch(/echo\s+.*secrets\./);
    expect(text).not.toMatch(/^\s*pull_request:/m);
  });
});
