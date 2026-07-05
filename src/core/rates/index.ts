// Core rate logic shared by the daily cron (writes) and /api/rates (reads).
// Navasan only quotes foreign currencies against IRR, so every stored row is
// "<rate> Toman per 1 unit of <currency>" with baseCurrency = the pivot.
import { db } from '@core/database/client';

import type { LatestRates, RatePoint, RatesSeries } from '@features/ExchangeRate/utils/currency';

import { PIVOT_CURRENCY, RATE_CURRENCIES } from '@/constants/currencies';

const NAVASAN_API_BASE = 'https://api.navasan.tech';
// Free-tier budget. We never call Navasan more than once per day (see
// ensureFreshRates), so real usage is ~31/month; this is just a hard backstop.
// We do NOT call the /usage/ endpoint (it would be a second billable request per
// refresh) — instead we count our own successful /latest/ calls locally.
const MONTHLY_LIMIT = 120;

interface NavasanItem {
  value: string;
  change?: number;
  timestamp?: number;
  date?: string;
}
type NavasanLatestResponse = Record<string, NavasanItem>;

function today(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Fetch every supported currency in a single Navasan `/latest/` call (no `item`
 * param returns all items at once — one request covers all currencies).
 */
async function fetchAllFromNavasan(apiKey: string): Promise<NavasanLatestResponse | null> {
  try {
    const res = await fetch(`${NAVASAN_API_BASE}/latest/?api_key=${apiKey}`);
    if (!res.ok) {
      console.error('[rates] Navasan returned', res.status);
      return null;
    }
    return (await res.json()) as NavasanLatestResponse;
  } catch (error) {
    console.error('[rates] Navasan fetch failed:', error);
    return null;
  }
}

/** How many billable Navasan /latest/ calls we've made this calendar month. */
async function navasanCallsThisMonth(): Promise<number> {
  try {
    const res = await db.execute({
      sql: `SELECT COUNT(*) as n FROM api_usage
            WHERE api_name = 'navasan' AND strftime('%Y-%m', checked_at) = strftime('%Y-%m', 'now')`,
    });
    return (res.rows[0]?.n as number) ?? 0;
  } catch {
    return 0;
  }
}

/** Record one successful /latest/ call so the monthly budget guard can count it. */
async function recordNavasanCall(): Promise<void> {
  await db.execute({
    sql: `INSERT INTO api_usage (api_name, monthly_usage, daily_usage, monthly_limit, checked_at)
          VALUES ('navasan', 0, 0, ?, ?)`,
    args: [MONTHLY_LIMIT, new Date().toISOString()],
  });
}

export interface RefreshResult {
  refreshed: boolean;
  reason?: string;
  inserted: string[];
  usage?: { monthly: number; remaining: number; limit: number };
}

/**
 * Fetch today's rates from Navasan (one /latest/ call) and upsert one
 * currencyRates row per currency. Budget-guarded by our own monthly call count;
 * on any failure the existing rows are left intact. Callers should normally go
 * through ensureFreshRates, which limits this to at most once per day.
 */
export async function refreshRates(apiKey: string | undefined): Promise<RefreshResult> {
  if (!apiKey) return { refreshed: false, reason: 'no-api-key', inserted: [] };

  const used = await navasanCallsThisMonth();
  if (used >= MONTHLY_LIMIT) {
    return { refreshed: false, reason: 'budget-exhausted', inserted: [] };
  }

  const data = await fetchAllFromNavasan(apiKey);
  if (!data) return { refreshed: false, reason: 'navasan-unavailable', inserted: [] };

  // Count the billable call as soon as it succeeds.
  await recordNavasanCall();

  const date = today();
  const now = new Date().toISOString();
  const inserted: string[] = [];

  for (const def of RATE_CURRENCIES) {
    const item = def.navasanItem ? data[def.navasanItem] : undefined;
    const value = item ? parseFloat(item.value) : NaN;
    if (!item || !Number.isFinite(value) || value <= 0) continue;

    await db.execute({
      sql: `INSERT INTO currencyRates (currency, baseCurrency, rate, rateDate, changeValue, navasanTimestamp, fetchedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(currency, baseCurrency, rateDate)
            DO UPDATE SET rate = excluded.rate, changeValue = excluded.changeValue,
                          navasanTimestamp = excluded.navasanTimestamp, fetchedAt = excluded.fetchedAt`,
      args: [def.code, PIVOT_CURRENCY, value, date, item.change ?? 0, item.timestamp ?? null, now],
    });
    inserted.push(def.code);
  }

  return {
    refreshed: true,
    inserted,
    usage: { monthly: used + 1, remaining: MONTHLY_LIMIT - used - 1, limit: MONTHLY_LIMIT },
  };
}

/**
 * The rate to use as a record's frozen `entryRate` snapshot: 1 for the pivot,
 * otherwise the latest known rate for the currency. Returns null if the currency
 * has no rate data yet (caller decides how to handle — e.g. reject the write).
 */
export async function getEntryRate(currency: string): Promise<number | null> {
  if (currency === PIVOT_CURRENCY) return 1;
  const latest = await getLatestRates();
  return latest[currency] ?? null;
}

/** Count of distinct rate currencies that already have a row for `date`. */
async function rateCurrenciesPresentOn(date: string): Promise<number> {
  const codes = RATE_CURRENCIES.map((c) => c.code);
  const placeholders = codes.map(() => '?').join(',');
  const res = await db.execute({
    sql: `SELECT COUNT(DISTINCT currency) as n FROM currencyRates WHERE rateDate = ? AND currency IN (${placeholders})`,
    args: [date, ...codes],
  });
  return (res.rows[0]?.n as number) ?? 0;
}

/** Date (YYYY-MM-DD) of the last attempt for the given marker, or null. */
async function getLastAttemptDate(marker: string): Promise<string | null> {
  const res = await db.execute({
    sql: `SELECT date(checked_at) as d FROM api_usage WHERE api_name = ? ORDER BY checked_at DESC LIMIT 1`,
    args: [marker],
  });
  return (res.rows[0]?.d as string | null) ?? null;
}

async function markAttempt(marker: string): Promise<void> {
  await db.execute({
    sql: `INSERT INTO api_usage (api_name, monthly_usage, daily_usage, monthly_limit, checked_at)
          VALUES (?, 0, 0, ?, ?)`,
    args: [marker, MONTHLY_LIMIT, new Date().toISOString()],
  });
}

/**
 * True when a supported rate currency has never been recorded at all (any date).
 * A brand-new, never-seeded currency is the signal that a currency was just
 * added to the registry and needs its first fetch — even if a normal refresh
 * already ran today.
 */
async function hasUnseededRateCurrency(): Promise<boolean> {
  const codes = RATE_CURRENCIES.map((c) => c.code);
  const placeholders = codes.map(() => '?').join(',');
  const res = await db.execute({
    sql: `SELECT COUNT(DISTINCT currency) as n FROM currencyRates WHERE currency IN (${placeholders})`,
    args: codes,
  });
  return ((res.rows[0]?.n as number) ?? 0) < codes.length;
}

/**
 * Ensure today's rates are present for every supported currency, fetching from
 * Navasan if any are missing. The normal fetch runs at most once per day
 * (guarded by a marker) so a currency Navasan doesn't return won't cause
 * repeated calls — keeping us well within budget. Safe to call on a hot read path.
 *
 * When a currency was just added to the registry (never seeded), a one-time
 * seed fetch runs even if the normal fetch already happened today, so newly
 * supported currencies work immediately instead of only after the next day's
 * cron. The seed is itself gated to once per day, so a currency Navasan never
 * returns can add at most one extra call per day (not a burst).
 */
export async function ensureFreshRates(apiKey: string | undefined): Promise<void> {
  if (!apiKey) return;
  const today = new Date().toISOString().split('T')[0];

  // All rate currencies already have today's row → nothing to do.
  if ((await rateCurrenciesPresentOn(today)) >= RATE_CURRENCIES.length) return;

  // Normal path: one multi-currency fetch per day.
  if ((await getLastAttemptDate('navasan_rates')) !== today) {
    await markAttempt('navasan_rates');
    await refreshRates(apiKey);
    return;
  }

  // Already fetched today, but a newly added currency has never been seeded →
  // do a single extra seed fetch (also gated to once per day).
  if ((await hasUnseededRateCurrency()) && (await getLastAttemptDate('navasan_seed')) !== today) {
    await markAttempt('navasan_seed');
    await refreshRates(apiKey);
  }
}

/**
 * Latest rate per currency (pivot omitted). "Latest" means the most recent rate
 * on or before today — future-dated rows (e.g. backfilled from future-dated
 * records) must never count as the current rate.
 */
export async function getLatestRates(): Promise<LatestRates> {
  const t = today();
  const res = await db.execute({
    sql: `SELECT cr.currency, cr.rate FROM currencyRates cr
          WHERE cr.rateDate <= ?
            AND cr.rateDate = (
              SELECT MAX(c2.rateDate) FROM currencyRates c2
              WHERE c2.currency = cr.currency AND c2.rateDate <= ?
            )`,
    args: [t, t],
  });
  const latest: LatestRates = {};
  for (const row of res.rows) latest[row.currency as string] = row.rate as number;
  return latest;
}

/** Full ascending time series per currency, optionally bounded by date. */
export async function getRatesSeries(from?: string, to?: string): Promise<RatesSeries> {
  const conditions: string[] = [];
  const args: (string | number)[] = [];
  if (from) {
    conditions.push('rateDate >= ?');
    args.push(from);
  }
  if (to) {
    conditions.push('rateDate <= ?');
    args.push(to);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const res = await db.execute({
    sql: `SELECT currency, rate, rateDate FROM currencyRates ${where} ORDER BY currency, rateDate ASC`,
    args,
  });
  const series: RatesSeries = {};
  for (const row of res.rows) {
    const code = row.currency as string;
    (series[code] ??= []).push({ rateDate: row.rateDate as string, rate: row.rate as number } as RatePoint);
  }
  return series;
}
