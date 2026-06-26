import { NextResponse } from 'next/server';

import { getSearchParams, withAuth } from '@core/api/utils';
import { db } from '@core/database/client';

// Net worth over time, in the pivot currency (IRT). The client converts to the
// user's primary/secondary currency for display.
interface NetWorthHistoryPoint {
  date: string;
  value: number;
}

export const GET = withAuth(async (user, request) => {
  const searchParams = getSearchParams(request);
  const from = searchParams.get('from') || '2000-01-01';
  const to = searchParams.get('to') || new Date().toISOString().slice(0, 10);

  // 1. Get all asset IDs for this user
  const assetsResult = await db.execute({
    sql: `SELECT id FROM assets WHERE userId = ?`,
    args: [user.userId],
  });

  const assetIds = assetsResult.rows.map((r) => r.id as number);

  if (assetIds.length === 0) {
    return NextResponse.json({ data: [] });
  }

  // 2. Fetch all valuations for those assets, ordered chronologically
  const placeholders = assetIds.map(() => '?').join(',');
  const valuationsResult = await db.execute({
    sql: `SELECT assetId, amount * entryRate AS value, valuedAt
          FROM assetValuations
          WHERE assetId IN (${placeholders})
          ORDER BY valuedAt ASC, id ASC`,
    args: assetIds,
  });

  // 3. Walk chronologically, maintaining latest value per asset (pivot currency)
  const latestValues = new Map<number, number>();
  const datePoints = new Map<string, number>();

  let emittedRangeStart = false;

  const sumLatest = (): number => {
    let total = 0;
    for (const v of latestValues.values()) total += v;
    return total;
  };

  for (const row of valuationsResult.rows) {
    const assetId = row.assetId as number;
    const value = (row.value as number) || 0;
    const valuedAt = (row.valuedAt as string).slice(0, 10);

    if (valuedAt < from) {
      latestValues.set(assetId, value);
      continue;
    }

    // Emit range-start point from pre-range data
    if (!emittedRangeStart) {
      emittedRangeStart = true;
      if (latestValues.size > 0) {
        const total = sumLatest();
        if (total > 0) datePoints.set(from, total);
      }
    }

    if (valuedAt > to) break;

    latestValues.set(assetId, value);
    datePoints.set(valuedAt, sumLatest());
  }

  const data: NetWorthHistoryPoint[] = Array.from(datePoints.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({ data });
}, 'NetWorthHistory');
