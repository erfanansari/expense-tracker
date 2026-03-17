import { NextResponse } from 'next/server';

import { createAssetSchema } from '@schemas';

import { validateBody, withAuth } from '@core/api/utils';
import { db } from '@core/database/client';

import type { Asset } from '@/@types/asset';

// GET /api/assets - List all user assets
export const GET = withAuth(async (user, request) => {
  let url: URL;
  try {
    url = new URL(request.url);
  } catch {
    url = new URL(request.url || '', 'http://localhost');
  }
  const { searchParams } = url;
  const categoryFilter = searchParams.get('category');

  let sql = `SELECT * FROM assets WHERE userId = ?`;
  const args: (string | number)[] = [user.userId];

  if (categoryFilter) {
    sql += ' AND category = ?';
    args.push(categoryFilter);
  }

  sql += ' ORDER BY category, name';

  const result = await db.execute({ sql, args });

  const assets: Asset[] = result.rows.map((row) => ({
    id: row.id as number,
    userId: row.userId as number,
    category: row.category as Asset['category'],
    name: row.name as string,
    quantity: row.quantity as number,
    unit: row.unit as string | null,
    unitValueUsd: row.unitValueUsd as number | null,
    totalValueUsd: row.totalValueUsd as number,
    totalValueToman: row.totalValueToman as number,
    exchangeRateUsed: row.exchangeRateUsed as number,
    notes: row.notes as string | null,
    lastValuedAt: row.lastValuedAt as string,
    createdAt: row.createdAt as string,
    updatedAt: row.updatedAt as string,
  }));

  return NextResponse.json(assets);
}, 'Assets');

// POST /api/assets - Create a new asset
export const POST = withAuth(async (user, request) => {
  const raw = await request.json();
  const result = validateBody(createAssetSchema, raw);
  if (result instanceof NextResponse) return result;

  const body = result.data;
  const lastValuedAt = body.lastValuedAt || new Date().toISOString();

  // Insert the asset
  const assetResult = await db.execute({
    sql: `INSERT INTO assets (userId, category, name, quantity, unit, unitValueUsd, totalValueUsd, totalValueToman, exchangeRateUsed, notes, lastValuedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
    args: [
      user.userId,
      body.category,
      body.name,
      body.quantity,
      body.unit || null,
      body.unitValueUsd || null,
      body.totalValueUsd,
      body.totalValueToman,
      body.exchangeRateUsed,
      body.notes || null,
      lastValuedAt,
    ],
  });

  const assetId = assetResult.rows[0].id as number;

  // Create initial valuation snapshot
  await db.execute({
    sql: `INSERT INTO assetValuations (assetId, quantity, unitValueUsd, totalValueUsd, totalValueToman, exchangeRateUsed, valuedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      assetId,
      body.quantity,
      body.unitValueUsd || null,
      body.totalValueUsd,
      body.totalValueToman,
      body.exchangeRateUsed,
      lastValuedAt,
    ],
  });

  return NextResponse.json({ message: 'Asset created successfully', id: assetId }, { status: 201 });
}, 'Assets');
