import { getTranslations } from 'next-intl/server';
import { NextResponse } from 'next/server';

import { createAssetSchema } from '@schemas';

import { getSearchParams, validateBody, withAuth } from '@core/api/utils';
import { db } from '@core/database/client';
import { mapRowToAsset } from '@core/database/mappers';
import { getEntryRate } from '@core/rates';

// GET /api/assets - List all user assets
export const GET = withAuth(async (user, request) => {
  const searchParams = getSearchParams(request);
  const categoryFilter = searchParams.get('category');

  let sql = `SELECT * FROM assets WHERE userId = ?`;
  const args: (string | number)[] = [user.userId];

  if (categoryFilter) {
    sql += ' AND category = ?';
    args.push(categoryFilter);
  }

  sql += ' ORDER BY category, name';

  const result = await db.execute({ sql, args });

  return NextResponse.json(result.rows.map(mapRowToAsset));
}, 'Assets');

// POST /api/assets - Create a new asset
export const POST = withAuth(async (user, request) => {
  const raw = await request.json();
  const t = await getTranslations();
  const result = validateBody(createAssetSchema(t), raw);
  if (result instanceof NextResponse) return result;

  const body = result.data;
  const lastValuedAt = body.lastValuedAt || new Date().toISOString();

  const entryRate = await getEntryRate(body.currency);
  if (entryRate === null) {
    return NextResponse.json({ error: `No exchange rate available for ${body.currency}` }, { status: 422 });
  }

  // Insert the asset and its opening valuation in one batch, so an asset can
  // never exist without its opening snapshot. Splitting these was how
  // `assets.lastValuedAt` came to disagree with the valuation history before —
  // the drift migration 020 had to repair by hand.
  const assetResult = await db.batch(
    [
      {
        sql: `INSERT INTO assets (userId, category, name, quantity, unit, unitValue, amount, currency, entryRate, linkedItem, notes, lastValuedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
        args: [
          user.userId,
          body.category,
          body.name,
          body.quantity,
          body.unit || null,
          body.unitValue ?? null,
          body.amount,
          body.currency,
          entryRate,
          body.linkedItem || null,
          body.notes || null,
          lastValuedAt,
        ],
      },
      {
        // `last_insert_rowid()` is the row the previous statement just wrote —
        // batch statements run sequentially in one transaction on one
        // connection. Selecting the snapshot back out of that row rather than
        // rebuilding it from the same JS values means the two cannot disagree.
        sql: `INSERT INTO assetValuations (assetId, quantity, unitValue, amount, currency, entryRate, valuedAt, source)
              SELECT id, quantity, unitValue, amount, currency, entryRate, lastValuedAt, 'manual'
                FROM assets WHERE id = last_insert_rowid()`,
      },
    ],
    'write'
  );

  const assetId = assetResult[0].rows[0].id as number;

  return NextResponse.json({ message: 'Asset created successfully', id: assetId }, { status: 201 });
}, 'Assets');
