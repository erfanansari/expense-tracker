// Currency conversion + formatting — the one place money math/formatting lives.
// Replaces the old tomanToUsd/usdToToman helpers. Rates pivot through PIVOT_CURRENCY
// (see src/constants/currencies.ts); Navasan only quotes foreign→IRR, so IRR is the base.
import { getCurrency, PIVOT_CURRENCY } from '@/constants/currencies';

/** A single day's rate: pivot units per 1 unit of the currency. */
export interface RatePoint {
  rateDate: string; // YYYY-MM-DD
  rate: number;
}

/**
 * Time series of rates keyed by currency code, each sorted ascending by date.
 * The pivot currency is omitted (its rate is always 1).
 */
export type RatesSeries = Record<string, RatePoint[]>;

/** Latest rate per currency (pivot omitted). */
export type LatestRates = Record<string, number>;

/**
 * Rate of `currency` against the pivot on `date`, using nearest-date
 * carry-forward (real-world FX standard): the last known rate on or before the
 * date; if the date predates all data, the earliest available rate. Returns
 * null when the currency has no rate data at all.
 */
export function rateOn(series: RatesSeries, currency: string, date?: string): number | null {
  if (currency === PIVOT_CURRENCY) return 1;
  const points = series[currency];
  if (!points || points.length === 0) return null;

  if (!date) return points[points.length - 1].rate; // no date → latest

  // points are sorted ascending; find last with rateDate <= date.
  let chosen: RatePoint | null = null;
  for (const p of points) {
    if (p.rateDate <= date) chosen = p;
    else break;
  }
  // Predates all data → fall back to the earliest known rate.
  return (chosen ?? points[0]).rate;
}

/**
 * Convert `amount` from one currency to another on a given date, pivoting
 * through the base currency. Same-currency is identity. Returns null when a
 * required rate is missing.
 */
export function convert(amount: number, from: string, to: string, series: RatesSeries, date?: string): number | null {
  if (from === to) return amount;
  const rFrom = rateOn(series, from, date);
  const rTo = rateOn(series, to, date);
  if (rFrom === null || rTo === null) return null;
  return (amount * rFrom) / rTo;
}

/** Build a single-day RatesSeries from a latest-rates map (for current-value displays). */
export function seriesFromLatest(latest: LatestRates, rateDate = ''): RatesSeries {
  const series: RatesSeries = {};
  for (const [code, rate] of Object.entries(latest)) {
    series[code] = [{ rateDate, rate }];
  }
  return series;
}

/**
 * Format an amount in a currency: localized number + symbol in the right place.
 * `compact` abbreviates large values (10.69B, $61.33K) for space-tight spots
 * like dashboard cards and charts; default is full precision with separators.
 */
export function formatMoney(amount: number, currencyCode: string, opts?: { compact?: boolean }): string {
  const def = getCurrency(currencyCode);
  const number = opts?.compact
    ? new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 2,
      }).format(amount)
    : new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: def.decimals,
      }).format(amount);

  return def.symbolPosition === 'prefix' ? `${def.symbol}${number}` : `${number} ${def.symbol}`;
}
