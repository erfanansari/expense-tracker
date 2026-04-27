import { NextResponse } from 'next/server';

import { getSearchParams, withAuth } from '@core/api/utils';
import { db } from '@core/database/client';

interface NetWorthHistoryPoint {
  date: string;
  valueUsd: number;
  valueToman: number;
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
    sql: `SELECT assetId, totalValueUsd, totalValueToman, valuedAt
          FROM assetValuations
          WHERE assetId IN (${placeholders})
          ORDER BY valuedAt ASC, id ASC`,
    args: assetIds,
  });

  // 3. Walk chronologically, maintaining latest value per asset
  const latestValues = new Map<number, { usd: number; toman: number }>();
  const datePoints = new Map<string, { valueUsd: number; valueToman: number }>();

  let emittedRangeStart = false;

  for (const row of valuationsResult.rows) {
    const assetId = row.assetId as number;
    const usd = row.totalValueUsd as number;
    const toman = row.totalValueToman as number;
    const valuedAt = (row.valuedAt as string).slice(0, 10);

    if (valuedAt < from) {
      latestValues.set(assetId, { usd, toman });
      continue;
    }

    // Emit range-start point from pre-range data
    if (!emittedRangeStart) {
      emittedRangeStart = true;
      if (latestValues.size > 0) {
        let totalUsd = 0;
        let totalToman = 0;
        for (const val of latestValues.values()) {
          totalUsd += val.usd;
          totalToman += val.toman;
        }
        if (totalUsd > 0 || totalToman > 0) {
          datePoints.set(from, { valueUsd: totalUsd, valueToman: totalToman });
        }
      }
    }

    if (valuedAt > to) break;

    latestValues.set(assetId, { usd, toman });

    // Sum all latest values for this date point
    let totalUsd = 0;
    let totalToman = 0;
    for (const val of latestValues.values()) {
      totalUsd += val.usd;
      totalToman += val.toman;
    }

    datePoints.set(valuedAt, { valueUsd: totalUsd, valueToman: totalToman });
  }

  const data: NetWorthHistoryPoint[] = Array.from(datePoints.entries())
    .map(([date, values]) => ({ date, ...values }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({ data });
}, 'NetWorthHistory');
