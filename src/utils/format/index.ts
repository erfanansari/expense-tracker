// Format number with commas
export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(Math.round(num));
}

const AXIS_FORMATTER = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  compactDisplay: 'short',
  maximumFractionDigits: 1,
});

// Compact tick labels for chart axes: 14B, 1.5M, 900K, 42.
export function formatAxisNumber(value: number): string {
  return AXIS_FORMATTER.format(value);
}

const SHORTHAND_MULTIPLIERS: Record<string, number> = {
  k: 1_000,
  m: 1_000_000,
  b: 1_000_000_000,
  t: 1_000_000_000_000,
};

// Parse shorthand notation like 4k, 3.2m, 1.5b into full numbers.
// Returns null for empty or invalid input so callers can fall back gracefully.
export function parseShorthandNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const match = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*([kmbt])$/i);
  if (match) {
    const base = parseFloat(match[1]);
    const multiplier = SHORTHAND_MULTIPLIERS[match[2].toLowerCase()];
    return base * multiplier;
  }

  const plain = parseFloat(trimmed);
  return isNaN(plain) ? null : plain;
}
