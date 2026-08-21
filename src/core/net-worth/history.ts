// Net-worth history: turning a stream of asset valuations into the points the
// chart plots. Pure — no clock, no I/O — so the route and the tests exercise
// exactly the same math.
//
// The important design rule: a point carries the *contributing valuations*, not
// a pre-summed total. Summing to a pivot currency on the server and converting
// that lump sum at a single date is lossy in two ways, and both showed up as
// the chart disagreeing with the assets page:
//
//   1. Each asset was last valued on its own date, so one shared rate is wrong
//      for all but one of them.
//   2. A record's `entryRate` is a frozen snapshot that deliberately does not
//      have to equal the rate series on that date. Round-tripping an amount
//      through the pivot (amount * entryRate / rateOn(date)) therefore does not
//      return the amount — not even when the asset is already held in the
//      display currency, where the assets page returns it untouched.
//
// Handing the client the parts lets it reuse `sumTo`, the same helper the
// assets page uses, so the two totals agree by construction rather than by
// coincidence.

/** One row of `assetValuations`, narrowed to what the math needs. */
export interface ValuationRow {
  assetId: number;
  /** Value in the entry currency. */
  amount: number;
  /** Entry currency code. */
  currency: string;
  /** Frozen rate to the pivot at entry time. */
  entryRate: number;
  /** YYYY-MM-DD. */
  valuedAt: string;
}

/** One plotted point: a date and the valuations that were current on it. */
export interface NetWorthPoint {
  date: string;
  items: ValuationRow[];
}

/**
 * Walk `rows` chronologically, keeping the latest valuation per asset, and emit
 * a point every time something changes inside [from, to].
 *
 * `rows` must be sorted ascending by (valuedAt, id) — the SQL query orders it.
 * Valuations before `from` are folded into a single point at `from` so a range
 * that opens mid-history still starts from the real balance rather than zero.
 */
export function buildNetWorthPoints(rows: ValuationRow[], from: string, to: string): NetWorthPoint[] {
  const latest = new Map<number, ValuationRow>();
  const points = new Map<string, ValuationRow[]>();
  let emittedRangeStart = false;

  const snapshot = (): ValuationRow[] => Array.from(latest.values());

  for (const row of rows) {
    const valuedAt = row.valuedAt.slice(0, 10);

    // Before the window: remember it, but don't plot it.
    if (valuedAt < from) {
      latest.set(row.assetId, row);
      continue;
    }

    if (valuedAt > to) break;

    // First in-range row — plot the carried-forward balance at the range start
    // so the line doesn't appear to begin at whatever this row happens to be.
    if (!emittedRangeStart) {
      emittedRangeStart = true;
      if (latest.size > 0) points.set(from, snapshot());
    }

    latest.set(row.assetId, row);
    points.set(valuedAt, snapshot());
  }

  return Array.from(points.entries())
    .map(([date, items]) => ({ date, items }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
