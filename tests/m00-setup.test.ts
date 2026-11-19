import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(__dirname, '..');

describe('M00 setup', () => {
  it('runs on Node 22 or newer', () => {
    expect(Number(process.versions.node.split('.')[0])).toBeGreaterThanOrEqual(22);
  });

  it('has the dependencies installed', () => {
    expect(existsSync(join(ROOT, 'node_modules', '.bin', 'vitest'))).toBe(true);
    expect(existsSync(join(ROOT, 'node_modules', '.bin', 'tsc'))).toBe(true);
  });

  it('has your hypotheses in docs/HIPOTESES.md (H1, H2 and H3, 25+ words each)', () => {
    const file = join(ROOT, 'docs', 'HIPOTESES.md');
    expect(existsSync(file), 'create docs/HIPOTESES.md (see the issue of module 00)').toBe(true);
    const text = readFileSync(file, 'utf8');
    for (const h of ['H1', 'H2', 'H3']) {
      const m = new RegExp(`^##\\s+${h}\\b[^\\n]*\\n([\\s\\S]*?)(?=^##\\s|$(?![\\s\\S]))`, 'm').exec(text);
      expect(m, `missing section "## ${h}"`).not.toBeNull();
      expect((m?.[1] ?? '').trim().split(/\s+/).filter(Boolean).length, `${h} needs 25+ words`).toBeGreaterThanOrEqual(25);
    }
  });
});
