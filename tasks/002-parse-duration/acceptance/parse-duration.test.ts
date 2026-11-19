import { describe, expect, it } from 'vitest';
import { parseDuration } from '../src/index';

describe('parseDuration', () => {
  it('[R1] parses a single part', () => {
    expect(parseDuration('250ms')).toBe(250);
    expect(parseDuration('45s')).toBe(45_000);
    expect(parseDuration('30m')).toBe(1_800_000);
    expect(parseDuration('2h')).toBe(7_200_000);
  });

  it('[R2] combines parts', () => {
    expect(parseDuration('1h30m')).toBe(5_400_000);
    expect(parseDuration('2m10s')).toBe(130_000);
    expect(parseDuration('1h1m1s1ms')).toBe(3_661_001);
  });

  it('[R3] accepts spaces', () => {
    expect(parseDuration(' 1h 30m ')).toBe(5_400_000);
  });

  it('[R4] throws SyntaxError for invalid input', () => {
    for (const bad of ['', '   ', '5x', '10', 'h', '-5s', '1h-5m']) {
      expect(() => parseDuration(bad), `input "${bad}"`).toThrow(SyntaxError);
    }
  });

  it('[R5] accepts decimals', () => {
    expect(parseDuration('1.5h')).toBe(5_400_000);
    expect(parseDuration('0.5s')).toBe(500);
  });

  it('[R6] supports days', () => {
    expect(parseDuration('1d')).toBe(86_400_000);
    expect(parseDuration('1d12h')).toBe(129_600_000);
  });

  it('[R7] zero is valid', () => {
    expect(parseDuration('0s')).toBe(0);
  });
});
