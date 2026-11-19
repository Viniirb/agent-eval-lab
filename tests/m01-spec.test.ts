import { describe, expect, it } from 'vitest';
import { parseSpec, validateSpec, weightOf } from '../src/spec/spec';

const SPEC = `# Title

Intro text that is not a requirement.

## Requirements

- **R1 [MUST]** The first thing.
- **R2 [SHOULD]** The second thing,
  continued on the next line.
* **R10 [MAY]** Uses a star bullet.

- Not a requirement, just a bullet.
- **X1 [MUST]** Wrong id format.
- **R3 [MUST ]** Wrong level format.
`;

describe('M01 parseSpec', () => {
  it('reads id, level and text', () => {
    const [first] = parseSpec(SPEC);
    expect(first).toEqual({ id: 'R1', level: 'MUST', text: 'The first thing.' });
  });

  it('joins indented continuation lines', () => {
    expect(parseSpec(SPEC)[1]?.text).toBe('The second thing, continued on the next line.');
  });

  it('accepts star bullets and multi-digit ids', () => {
    expect(parseSpec(SPEC)[2]).toEqual({ id: 'R10', level: 'MAY', text: 'Uses a star bullet.' });
  });

  it('ignores everything that is not a well-formed requirement', () => {
    expect(parseSpec(SPEC).map((r) => r.id)).toEqual(['R1', 'R2', 'R10']);
  });

  it('returns an empty list for an empty document', () => {
    expect(parseSpec('')).toEqual([]);
  });
});

describe('M01 weightOf', () => {
  it('MUST 3, SHOULD 2, MAY 1', () => {
    expect([weightOf('MUST'), weightOf('SHOULD'), weightOf('MAY')]).toEqual([3, 2, 1]);
  });
});

describe('M01 validateSpec', () => {
  it('accepts a good spec', () => {
    expect(validateSpec(parseSpec(SPEC))).toEqual([]);
  });

  it('reports duplicate ids', () => {
    const errors = validateSpec([
      { id: 'R1', level: 'MUST', text: 'a' },
      { id: 'R1', level: 'MAY', text: 'b' },
    ]);
    expect(errors).toContain('duplicate id R1');
  });

  it('reports empty text', () => {
    expect(validateSpec([{ id: 'R1', level: 'MUST', text: '  ' }])).toContain('R1 has no text');
  });

  it('requires at least one MUST', () => {
    expect(validateSpec([{ id: 'R1', level: 'MAY', text: 'x' }])).toContain('the spec needs at least one MUST requirement');
  });

  it('reports every problem, not only the first', () => {
    expect(validateSpec([])).toHaveLength(1);
    expect(
      validateSpec([
        { id: 'R1', level: 'MAY', text: '' },
        { id: 'R1', level: 'SHOULD', text: 'x' },
      ]).length,
    ).toBeGreaterThanOrEqual(3);
  });
});
