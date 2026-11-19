import type { Level, Requirement } from '../types';
import { todo } from '../todo';

/**
 * M01. Reads requirements from a SPEC.md. Format of one requirement:
 *   - **R1 [MUST]** The limiter allows up to `limit` calls per window.
 *
 * Rules:
 *  - the bullet can be `-` or `*`; ids can have many digits (R10); levels are MUST, SHOULD or MAY
 *  - a line indented by 2 or more spaces right after a requirement CONTINUES its text (join with one space)
 *  - any other line (headings, plain bullets, `**X1 [MUST]**`, `**R3 [MUST ]**`) is ignored and ends a continuation
 * Hint: one regular expression with groups, and a variable that remembers the requirement being read.
 */
export function parseSpec(markdown: string): Requirement[] {
  void markdown;
  return todo('M01', 'implement parseSpec');
}

/** M01. MUST counts 3, SHOULD 2, MAY 1: a failed MUST hurts more than a failed MAY. */
export function weightOf(level: Level): number {
  void level;
  return todo('M01', 'implement weightOf');
}

/**
 * M01. A spec is usable when ids are unique, no text is empty and at least one requirement is MUST.
 * Return ALL problems (not only the first), with these exact messages:
 *   `duplicate id R1` · `R1 has no text` · `the spec needs at least one MUST requirement`
 */
export function validateSpec(requirements: Requirement[]): string[] {
  void requirements;
  return todo('M01', 'implement validateSpec');
}
