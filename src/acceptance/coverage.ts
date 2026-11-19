import type { Coverage, Requirement, RequirementCoverage, TestResult } from '../types';
import { weightOf } from '../spec/spec';

/** Finds requirement tags in a test title: "[R1] allows N calls [R2]" gives ["R1", "R2"]. */
export function extractTags(title: string): string[] {
  const tags = [...title.matchAll(/\[(R\d+)\]/g)].map((m) => m[1] as string);
  return [...new Set(tags)];
}

/**
 * Connects acceptance test results to requirements.
 *  - A requirement PASSES only if it has at least one tagged test and ALL its tagged tests passed.
 *  - Skipped tests count as not passed. A requirement with no tagged test is "untested" (and counts as failed).
 *  - `weighted` = weight of passed requirements / weight of all requirements (MUST 3, SHOULD 2, MAY 1).
 */
export function requirementCoverage(requirements: Requirement[], tests: TestResult[]): Coverage {
  const perRequirement: Record<string, RequirementCoverage> = {};
  for (const r of requirements) perRequirement[r.id] = { status: 'untested', total: 0, passed: 0 };

  for (const test of tests) {
    for (const tag of extractTags(test.title)) {
      const entry = perRequirement[tag];
      if (!entry) continue;
      entry.total += 1;
      if (test.status === 'passed') entry.passed += 1;
    }
  }

  let earned = 0;
  let possible = 0;
  for (const r of requirements) {
    const entry = perRequirement[r.id] as RequirementCoverage;
    entry.status = entry.total === 0 ? 'untested' : entry.passed === entry.total ? 'passed' : 'failed';
    possible += weightOf(r.level);
    if (entry.status === 'passed') earned += weightOf(r.level);
  }
  return { perRequirement, weighted: possible === 0 ? 0 : earned / possible };
}
