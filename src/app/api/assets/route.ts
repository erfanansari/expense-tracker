import { NextResponse } from 'next/server';

import type { Asset, CreateAssetInput } from '@/@types/asset';
import { ASSET_CATEGORIES } from '@/constants/assets';
import { db } from '@/core/database/client';
import { getCurrentUser } from '@/core/session/session';

// GET /api/assets - List all user assets
// Query parameters:
//   - category: filter by category (optional)
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
  } catch (error) {
    console.error('[Assets] Failed to fetch:', error);
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
  }
}

// POST /api/assets - Create a new asset
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateAssetInput = await request.json();

    // Validate required fields
    if (
      !body.category ||
      !body.name ||
      body.quantity === undefined ||
      body.totalValueUsd === undefined ||
      body.totalValueToman === undefined ||
      body.exchangeRateUsed === undefined
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate category
    const validCategories = ASSET_CATEGORIES.map((c) => c.value);
    if (!validCategories.includes(body.category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

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
  } catch (error) {
    console.error('[Assets] Failed to create:', error);
    return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 });
  }
}
