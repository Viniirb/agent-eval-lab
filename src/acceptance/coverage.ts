import type { Coverage, Requirement, TestResult } from '../types';
import { todo } from '../todo';

/** M03. Finds requirement tags in a test title: "[R1] allows N calls [R2]" gives ["R1", "R2"] (no repeats). */
export function extractTags(title: string): string[] {
  void title;
  return todo('M03', 'implement extractTags');
}

/**
 * M03. Connects acceptance test results to requirements.
 *  - Every requirement appears in `perRequirement`, even without tests.
 *  - A requirement PASSES only if it has at least one tagged test and ALL its tagged tests passed.
 *  - Skipped tests count as not passed ("failed" status for the requirement). No tagged test = "untested".
 *  - Tags that are not in the spec are ignored.
 *  - `weighted` = weight of passed requirements / weight of all requirements (use `weightOf`); 0 when there are no requirements.
 */
export function requirementCoverage(requirements: Requirement[], tests: TestResult[]): Coverage {
  void requirements;
  void tests;
  return todo('M03', 'implement requirementCoverage');
}
