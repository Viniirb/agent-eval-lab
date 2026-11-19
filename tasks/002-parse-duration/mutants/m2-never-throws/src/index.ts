const UNITS: Record<string, number> = {
  d: 86_400_000,
  h: 3_600_000,
  m: 60_000,
  s: 1_000,
  ms: 1,
};

const PART = /(\d+(?:\.\d+)?)(ms|d|h|m|s)/y;

export function parseDuration(input: string): number {
  const text = input.replace(/\s+/g, '');
  if (text === '') return 0;

  let total = 0;
  let index = 0;
  while (index < text.length) {
    PART.lastIndex = index;
    const match = PART.exec(text);
    if (!match) return total;
    total += Number(match[1]) * (UNITS[match[2] as string] as number);
    index = PART.lastIndex;
  }
  return total;
}
