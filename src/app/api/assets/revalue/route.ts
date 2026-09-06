import { NextResponse } from 'next/server';

import { withAuth } from '@core/api/utils';
import { db } from '@core/database/client';
import { mapRowToAsset } from '@core/database/mappers';
import { ensureFreshRates, getLatestRates } from '@core/rates';

import { getCurrency, PIVOT_CURRENCY } from '@/constants/currencies';
import { getTrackedItem } from '@/constants/tracked-items';

// POST /api/assets/revalue — bulk-revalue the user's assets at current rates.
//
// Two revalue semantics:
// - Linked assets (assets.linkedItem): the tracked item's current price is the
//   truth → unitValue = price in the asset's currency, amount = quantity × unitValue.
// - Unlinked foreign-currency assets: the stored amount is the user's truth →
//   only entryRate re-snapshots to today's rate (identity invariant: the
//   amount in the asset's own currency never changes).
// Unlinked pivot-currency assets have nothing to sync and are skipped.
//
// Body { dryRun: true } returns the computed changes without writing — the
// preview the client shows before applying. Apply mode writes the asset rows
// plus one assetValuations snapshot each (same shape as PUT /api/assets/[id]).

interface RevalueValues {
  amount: number;
  unitValue: number | null;
  entryRate: number;
}

export interface RevalueChange {
  id: number;
  name: string;
  currency: string;
  linkedItem: string | null;
  old: RevalueValues;
  next: RevalueValues;
}

export type RevalueSkipReason = 'manual' | 'no-rate' | 'no-price' | 'no-quantity' | 'unchanged';

export interface RevalueSkip {
  id: number;
  name: string;
  reason: RevalueSkipReason;
}

const roundTo = (value: number, decimals: number): number => {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
};

export const POST = withAuth(async (user, request) => {
  const body = (await request.json().catch(() => ({}))) as { dryRun?: boolean };
  const dryRun = body.dryRun === true;

  // Prices/rates are at most a day old and this shares the daily fetch guard —
  // no extra Navasan budget.
  await ensureFreshRates(process.env.NAVASAN_API_KEY);
  const latest = await getLatestRates();

  const result = await db.execute({
    sql: 'SELECT * FROM assets WHERE userId = ? ORDER BY category, name',
    args: [user.userId],
  });
  const assets = result.rows.map(mapRowToAsset);

  const changes: RevalueChange[] = [];
  const skipped: RevalueSkip[] = [];

  for (const asset of assets) {
    const skip = (reason: RevalueSkipReason) => skipped.push({ id: asset.id, name: asset.name, reason });

    const isPivot = asset.currency === PIVOT_CURRENCY;
    const currencyRate = isPivot ? 1 : latest[asset.currency];
    const linked = getTrackedItem(asset.linkedItem);

    if (!linked && isPivot) {
      skip('manual');
      continue;
    }
    if (currencyRate == null || currencyRate <= 0) {
      skip('no-rate');
      continue;
    }

    const decimals = getCurrency(asset.currency).decimals;
    let next: RevalueValues;

    if (linked) {
      const priceToman = latest[linked.code];
      if (priceToman == null || priceToman <= 0) {
        skip('no-price');
        continue;
      }
      if (!(asset.quantity > 0)) {
        skip('no-quantity');
        continue;
      }
      const unitValue = roundTo(priceToman / currencyRate, decimals);
      next = {
        amount: roundTo(asset.quantity * unitValue, decimals),
        unitValue,
        entryRate: currencyRate,
      };
    } else {
      next = { amount: asset.amount, unitValue: asset.unitValue, entryRate: currencyRate };
    }

    // Idempotency: identical post-rounding values (e.g. a second click the
    // same day) must not write rows or spam valuation snapshots.
    if (next.amount === asset.amount && next.entryRate === asset.entryRate && next.unitValue === asset.unitValue) {
      skip('unchanged');
      continue;
    }

    changes.push({
      id: asset.id,
      name: asset.name,
      currency: asset.currency,
      linkedItem: asset.linkedItem,
      old: { amount: asset.amount, unitValue: asset.unitValue, entryRate: asset.entryRate },
      next,
    });
  }

  if (!dryRun && changes.length > 0) {
    const valuedAt = new Date().toISOString();
    // One atomic batch — a mid-batch failure must not leave half the portfolio
    // revalued at new rates and half at old ones.
    const statements = changes.flatMap((change) => {
      const asset = assets.find((a) => a.id === change.id);
      if (!asset) return [];
      return [
        {
          sql: `UPDATE assets
                SET amount = ?, unitValue = ?, entryRate = ?, lastValuedAt = ?, updatedAt = CURRENT_TIMESTAMP
                WHERE id = ? AND userId = ?`,
          args: [change.next.amount, change.next.unitValue, change.next.entryRate, valuedAt, change.id, user.userId],
        },
        {
          sql: `INSERT INTO assetValuations (assetId, quantity, unitValue, amount, currency, entryRate, valuedAt, source)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'revalue')`,
          args: [
            change.id,
            asset.quantity,
            change.next.unitValue,
            change.next.amount,
            asset.currency,
            change.next.entryRate,
            valuedAt,
          ],
        },
      ];
    });
    await db.batch(statements, 'write');
  }

  return NextResponse.json({ applied: !dryRun, changes, skipped });
}, 'Assets');
