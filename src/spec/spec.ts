import type { Level, Requirement } from '../types';

const LINE = /^\s*[-*]\s+\*\*(R\d+)\s+\[(MUST|SHOULD|MAY)\]\*\*\s+(.+?)\s*$/;

/**
 * Reads requirements from a SPEC.md. Format of one requirement:
 *   - **R1 [MUST]** The limiter allows up to `limit` calls per window.
 * A line indented by 2+ spaces right after a requirement continues its text.
 */
export function parseSpec(markdown: string): Requirement[] {
  const requirements: Requirement[] = [];
  let current: Requirement | undefined;
  for (const line of markdown.split(/\r?\n/)) {
    const match = LINE.exec(line);
    if (match) {
      current = { id: match[1] as string, level: match[2] as Level, text: match[3] as string };
      requirements.push(current);
    } else if (current && /^\s{2,}\S/.test(line)) {
      current.text += ' ' + line.trim();
    } else {
      current = undefined;
    }
  }
  return requirements;
}

/** MUST counts 3, SHOULD 2, MAY 1: a failed MUST hurts more than a failed MAY. */
export function weightOf(level: Level): number {
  switch (level) {
    case 'MUST':
      return 3;
    case 'SHOULD':
      return 2;
    case 'MAY':
      return 1;
  }
}

/** A spec is usable when ids are unique, text is not empty and at least one requirement is MUST. */
export function validateSpec(requirements: Requirement[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const r of requirements) {
    if (seen.has(r.id)) errors.push(`duplicate id ${r.id}`);
    seen.add(r.id);
    if (!r.text.trim()) errors.push(`${r.id} has no text`);
  }
  if (!requirements.some((r) => r.level === 'MUST')) errors.push('the spec needs at least one MUST requirement');
  return errors;
}
