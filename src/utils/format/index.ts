import { autoConvertDigitsToEN } from '@persian-tools/persian-tools';

export type NumberLocale = 'en' | 'fa';

function toIntlLocale(locale: NumberLocale): string {
  return locale === 'fa' ? 'fa-IR' : 'en-US';
}

// Format number with commas (or Persian grouping + digits for fa).
export function formatNumber(num: number, locale: NumberLocale = 'en'): string {
  return new Intl.NumberFormat(toIntlLocale(locale)).format(Math.round(num));
}

// Format a plain calendar year — Persian digits for fa, but no thousands grouping
// ("1405" not "1,405"; "2026" not "2,026"), unlike formatNumber.
export function formatYear(year: number, locale: NumberLocale = 'en'): string {
  return new Intl.NumberFormat(toIntlLocale(locale), { useGrouping: false }).format(year);
}

const AXIS_FORMATTERS: Record<NumberLocale, Intl.NumberFormat> = {
  en: new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short', maximumFractionDigits: 1 }),
  fa: new Intl.NumberFormat('fa-IR', { notation: 'compact', compactDisplay: 'short', maximumFractionDigits: 1 }),
};

// Compact tick labels for chart axes: 14B, 1.5M, 900K, 42 (fa: Persian digits/words).
export function formatAxisNumber(value: number, locale: NumberLocale = 'en'): string {
  return AXIS_FORMATTERS[locale].format(value);
}

const SHORTHAND_MULTIPLIERS: Record<string, number> = {
  k: 1_000,
  m: 1_000_000,
  b: 1_000_000_000,
  t: 1_000_000_000_000,
};

// Thousands separators that pasted formatted numbers may carry: comma, Arabic
// thousands separator (٬ U+066C), Arabic comma (، U+060C), and the space family
// (\s already covers regular space, NBSP U+00A0, and the narrow NBSP U+202F
// that Intl.NumberFormat emits).
const GROUPING_CHARS = /[,٬،\s]/g;

// Live keystroke filter for amount fields: true when the string could still
// become a valid amount — digits (Latin/Persian/Arabic), grouping separators,
// decimal separators, a leading sign, and at most one trailing k/m/b/t.
// Looser than parseShorthandNumber (it accepts partial input like "3." or "-")
// so typing is never blocked mid-entry; it only rejects impossible characters.
export function isPlausibleAmountInput(raw: string): boolean {
  return /^-?[0-9۰-۹٠-٩.,٫٬،\s]*[kmbt]?$/i.test(raw);
}

// Parse shorthand notation like 4k, 3.2m, 1.5b into full numbers. Persian/Arabic
// digits (entered on an fa keyboard) are normalized to Latin first, and grouping
// separators from pasted formatted numbers ("343,433", "۳۴۳٬۴۳۳") are stripped —
// without this, parseFloat would silently truncate at the first separator.
// Trade-off: "1,2" parses as 12, not 1.2; the Persian decimal ٫ (U+066B) is the
// supported decimal separator alongside ".".
// Returns null for empty or invalid input so callers can fall back gracefully.
export function parseShorthandNumber(value: string): number | null {
  const trimmed = autoConvertDigitsToEN(value.trim()).replace(GROUPING_CHARS, '').replace(/٫/g, '.');
  if (!trimmed) return null;

  const match = trimmed.match(/^(-?\d+(?:\.\d+)?)([kmbt])$/i);
  if (match) {
    const base = parseFloat(match[1]);
    const multiplier = SHORTHAND_MULTIPLIERS[match[2].toLowerCase()];
    return base * multiplier;
  }

  // Full-string match (not parseFloat) so junk like "12abc" is rejected
  // instead of silently truncated.
  if (!/^-?(\d+(\.\d*)?|\.\d+)$/.test(trimmed)) return null;
  const plain = parseFloat(trimmed);
  return isNaN(plain) ? null : plain;
}
