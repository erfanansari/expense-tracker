import { NextResponse } from 'next/server';

import type { Asset, AssetValuation, UpdateAssetInput } from '@/@types/asset';
import { ASSET_CATEGORIES } from '@/constants/assets';
import { db } from '@/core/database/client';
import { getCurrentUser } from '@/core/session/session';

// GET /api/assets/[id] - Get a single asset with valuation history
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: 'Invalid asset ID' }, { status: 400 });
    }

    // Get asset
    const assetResult = await db.execute({
      sql: `SELECT * FROM assets WHERE id = ? AND userId = ?`,
      args: [Number(id), user.userId],
    });

    if (assetResult.rows.length === 0) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    const row = assetResult.rows[0];
    const asset: Asset = {
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
    };

    // Get valuation history (last 30 entries)
    const valuationsResult = await db.execute({
      sql: `SELECT * FROM assetValuations
            WHERE assetId = ?
            ORDER BY valuedAt DESC
            LIMIT 30`,
      args: [Number(id)],
    });

    const valuations: AssetValuation[] = valuationsResult.rows.map((v) => ({
      id: v.id as number,
      assetId: v.assetId as number,
      quantity: v.quantity as number,
      unitValueUsd: v.unitValueUsd as number | null,
      totalValueUsd: v.totalValueUsd as number,
      totalValueToman: v.totalValueToman as number,
      exchangeRateUsed: v.exchangeRateUsed as number,
      valuedAt: v.valuedAt as string,
      createdAt: v.createdAt as string,
    }));

    return NextResponse.json({ asset, valuations });
  } catch (error) {
    console.error('[Assets] Failed to fetch:', error);
    return NextResponse.json({ error: 'Failed to fetch asset' }, { status: 500 });
  }
}

// PUT /api/assets/[id] - Update an asset (creates new valuation snapshot)
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: 'Invalid asset ID' }, { status: 400 });
    }

    // Check if asset belongs to user
    const existing = await db.execute({
      sql: 'SELECT * FROM assets WHERE id = ? AND userId = ?',
      args: [Number(id), user.userId],
    });

    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    const currentAsset = existing.rows[0];
    const body: UpdateAssetInput = await request.json();

    // Build dynamic update query
    const updates: string[] = [];
    const args: (string | number | null)[] = [];

    // Track if valuation changed for snapshot
    let valuationChanged = false;
    const newQuantity = body.quantity ?? (currentAsset.quantity as number);
    const newUnitValueUsd = body.unitValueUsd ?? (currentAsset.unitValueUsd as number | null);
    const newTotalValueUsd = body.totalValueUsd ?? (currentAsset.totalValueUsd as number);
    const newTotalValueToman = body.totalValueToman ?? (currentAsset.totalValueToman as number);
    const newExchangeRate = body.exchangeRateUsed ?? (currentAsset.exchangeRateUsed as number);

    if (body.category !== undefined) {
      const validCategories = ASSET_CATEGORIES.map((c) => c.value);
      if (!validCategories.includes(body.category)) {
        return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
      }
      updates.push('category = ?');
      args.push(body.category);
    }

    if (body.name !== undefined) {
      updates.push('name = ?');
      args.push(body.name);
    }

    if (body.quantity !== undefined) {
      updates.push('quantity = ?');
      args.push(body.quantity);
      if (body.quantity !== currentAsset.quantity) valuationChanged = true;
    }

    if (body.unit !== undefined) {
      updates.push('unit = ?');
      args.push(body.unit || null);
    }

    if (body.unitValueUsd !== undefined) {
      updates.push('unitValueUsd = ?');
      args.push(body.unitValueUsd);
      if (body.unitValueUsd !== currentAsset.unitValueUsd) valuationChanged = true;
    }

    if (body.totalValueUsd !== undefined) {
      updates.push('totalValueUsd = ?');
      args.push(body.totalValueUsd);
      if (body.totalValueUsd !== currentAsset.totalValueUsd) valuationChanged = true;
    }

    if (body.totalValueToman !== undefined) {
      updates.push('totalValueToman = ?');
      args.push(body.totalValueToman);
      if (body.totalValueToman !== currentAsset.totalValueToman) valuationChanged = true;
    }

    if (body.exchangeRateUsed !== undefined) {
      updates.push('exchangeRateUsed = ?');
      args.push(body.exchangeRateUsed);
    }

    if (body.notes !== undefined) {
      updates.push('notes = ?');
      args.push(body.notes || null);
    }

    if (body.lastValuedAt !== undefined) {
      updates.push('lastValuedAt = ?');
      args.push(body.lastValuedAt);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Update lastValuedAt if valuation changed
    const valuedAt = body.lastValuedAt || new Date().toISOString();
    if (valuationChanged && body.lastValuedAt === undefined) {
      updates.push('lastValuedAt = ?');
      args.push(valuedAt);
    }

    updates.push('updatedAt = CURRENT_TIMESTAMP');
    args.push(Number(id), user.userId);

    await db.execute({
      sql: `UPDATE assets SET ${updates.join(', ')} WHERE id = ? AND userId = ?`,
      args,
    });

    // Create valuation snapshot if values changed
    if (valuationChanged) {
      await db.execute({
        sql: `INSERT INTO assetValuations (assetId, quantity, unitValueUsd, totalValueUsd, totalValueToman, exchangeRateUsed, valuedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          Number(id),
          newQuantity,
          newUnitValueUsd,
          newTotalValueUsd,
          newTotalValueToman,
          newExchangeRate,
          valuedAt,
        ],
      });
    }

    return NextResponse.json({ message: 'Asset updated successfully' });
  } catch (error) {
    console.error('[Assets] Failed to update:', error);
    return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 });
  }
}

// DELETE /api/assets/[id] - Delete an asset and its valuations
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: 'Invalid asset ID' }, { status: 400 });
    }

    // Delete asset (valuations will cascade delete due to foreign key)
    const result = await db.execute({
      sql: 'DELETE FROM assets WHERE id = ? AND userId = ?',
      args: [Number(id), user.userId],
    });

    if (result.rowsAffected === 0) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('[Assets] Failed to delete:', error);
    return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 });
  }
}
