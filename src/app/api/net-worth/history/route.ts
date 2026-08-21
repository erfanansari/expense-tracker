import { NextResponse } from 'next/server';

import { getSearchParams, withAuth } from '@core/api/utils';
import { db } from '@core/database/client';
import { buildNetWorthPoints, type ValuationRow } from '@core/net-worth/history';

// Net worth over time. Each point carries the *valuations* that were current on
// its date rather than a pre-summed total, because only the client knows the
// display currency — and, more importantly, because a single pre-summed pivot
// figure can't be converted back without drifting away from the assets page
// (see src/core/net-worth/history.ts for why).
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
    sql: `SELECT assetId, amount, currency, entryRate, valuedAt
          FROM assetValuations
          WHERE assetId IN (${placeholders})
          ORDER BY valuedAt ASC, id ASC`,
    args: assetIds,
  });

  const rows: ValuationRow[] = valuationsResult.rows.map((r) => ({
    assetId: r.assetId as number,
    amount: (r.amount as number) || 0,
    currency: (r.currency as string) || 'IRT',
    entryRate: (r.entryRate as number) || 1,
    valuedAt: (r.valuedAt as string).slice(0, 10),
  }));

  return NextResponse.json({ data: buildNetWorthPoints(rows, from, to) });
}, 'NetWorthHistory');
