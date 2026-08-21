import { convert, rateOn, type RatesSeries } from '@features/ExchangeRate/utils/currency';

import { buildNetWorthPoints, type ValuationRow } from '../history';

// A rate series where the frozen entryRate a record carries deliberately does
// NOT equal the series rate on that same date. That gap is the whole bug: the
// assets page converts through the frozen rate, the chart used to convert a
// pre-summed pivot total through the series, and the two disagreed.
const series: RatesSeries = {
  USD: [
    { rateDate: '2026-01-01', rate: 60_000 },
    { rateDate: '2026-02-01', rate: 70_000 },
    { rateDate: '2026-03-01', rate: 80_000 },
  ],
  GBP: [
    { rateDate: '2026-01-01', rate: 75_000 },
    { rateDate: '2026-03-01', rate: 100_000 },
  ],
};

const row = (o: Partial<ValuationRow> & Pick<ValuationRow, 'assetId' | 'amount' | 'valuedAt'>): ValuationRow => ({
  currency: 'USD',
  entryRate: 60_000,
  ...o,
});

/** The assets-page total: each asset converted at its own valuation date. */
const assetsPageTotal = (rows: ValuationRow[], to: string): number => {
  // latest valuation per asset — exactly what GET /api/assets exposes
  const latest = new Map<number, ValuationRow>();
  for (const r of rows) latest.set(r.assetId, r);
  let total = 0;
  for (const r of latest.values()) {
    if (to === r.currency) {
      total += r.amount;
      continue;
    }
    const pivot = r.amount * r.entryRate;
    const rTo = rateOn(series, to, r.valuedAt);
    if (rTo) total += pivot / rTo;
  }
  return total;
};

/** Sum a point the way the chart will: each item at its own date. */
const sumPoint = (items: ValuationRow[], to: string): number => {
  let total = 0;
  for (const it of items) {
    if (to === it.currency) {
      total += it.amount;
      continue;
    }
    const pivot = it.amount * it.entryRate;
    const rTo = rateOn(series, to, it.valuedAt);
    if (rTo) total += pivot / rTo;
  }
  return total;
};

describe('buildNetWorthPoints', () => {
  it('emits one point per valuation date, carrying the latest value of every asset', () => {
    const points = buildNetWorthPoints(
      [
        row({ assetId: 1, amount: 100, valuedAt: '2026-01-10' }),
        row({ assetId: 2, amount: 200, valuedAt: '2026-02-10' }),
        row({ assetId: 1, amount: 150, valuedAt: '2026-03-10' }),
      ],
      '2026-01-01',
      '2026-12-31'
    );

    expect(points.map((p) => p.date)).toEqual(['2026-01-10', '2026-02-10', '2026-03-10']);
    // Second point still carries asset 1 at its January value.
    expect(points[1].items.map((i) => i.amount).sort((a, b) => a - b)).toEqual([100, 200]);
    // Third point has asset 1 revalued, asset 2 unchanged.
    expect(points[2].items.map((i) => i.amount).sort((a, b) => a - b)).toEqual([150, 200]);
  });

  it('carries pre-range valuations forward into a point at the range start', () => {
    const points = buildNetWorthPoints(
      [
        row({ assetId: 1, amount: 100, valuedAt: '2025-06-01' }),
        row({ assetId: 2, amount: 200, valuedAt: '2026-02-10' }),
      ],
      '2026-01-01',
      '2026-12-31'
    );

    expect(points[0].date).toBe('2026-01-01');
    expect(points[0].items).toHaveLength(1);
    expect(points[0].items[0].amount).toBe(100);
  });

  it('excludes valuations after the range end', () => {
    const points = buildNetWorthPoints(
      [
        row({ assetId: 1, amount: 100, valuedAt: '2026-01-10' }),
        row({ assetId: 1, amount: 999, valuedAt: '2026-09-01' }),
      ],
      '2026-01-01',
      '2026-06-30'
    );
    expect(points).toHaveLength(1);
    expect(points[0].items[0].amount).toBe(100);
  });

  // ── The regression this module exists for ────────────────────────────────
  it('final point matches the assets page total when an asset is held in the display currency', () => {
    // Asset 1 is held in USD and the user displays USD. The assets page returns
    // the raw 100 (identity). entryRate (60k) != the USD series rate on
    // 2026-03-10 (80k), so a pivot round-trip would return 100 * 60/80 = 75.
    const rows = [row({ assetId: 1, amount: 100, currency: 'USD', entryRate: 60_000, valuedAt: '2026-03-10' })];
    const points = buildNetWorthPoints(rows, '2026-01-01', '2026-12-31');
    const last = points[points.length - 1];

    expect(sumPoint(last.items, 'USD')).toBeCloseTo(assetsPageTotal(rows, 'USD'), 6);
    expect(sumPoint(last.items, 'USD')).toBeCloseTo(100, 6);
  });

  it('final point matches the assets page total across mixed currencies and dates', () => {
    const rows = [
      row({ assetId: 1, amount: 100, currency: 'USD', entryRate: 60_000, valuedAt: '2026-01-10' }),
      row({ assetId: 2, amount: 50, currency: 'GBP', entryRate: 75_000, valuedAt: '2026-02-10' }),
      row({ assetId: 3, amount: 1_000_000, currency: 'IRT', entryRate: 1, valuedAt: '2026-03-10' }),
    ];
    const points = buildNetWorthPoints(rows, '2026-01-01', '2026-12-31');
    const last = points[points.length - 1];

    for (const display of ['USD', 'GBP', 'IRT']) {
      expect(sumPoint(last.items, display)).toBeCloseTo(assetsPageTotal(rows, display), 6);
    }
  });

  it('a pre-summed pivot total converted at one date does NOT match — the old behaviour', () => {
    const rows = [
      row({ assetId: 1, amount: 100, currency: 'USD', entryRate: 60_000, valuedAt: '2026-01-10' }),
      row({ assetId: 2, amount: 50, currency: 'GBP', entryRate: 75_000, valuedAt: '2026-02-10' }),
    ];
    const points = buildNetWorthPoints(rows, '2026-01-01', '2026-12-31');
    const last = points[points.length - 1];

    const pivotTotal = last.items.reduce((s, i) => s + i.amount * i.entryRate, 0);
    const oldWay = convert(pivotTotal, 'IRT', 'USD', series, last.date);

    expect(oldWay).not.toBeCloseTo(assetsPageTotal(rows, 'USD'), 2);
  });
});
