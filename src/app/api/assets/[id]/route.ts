import { NextResponse } from 'next/server';

import { createAssetSchema } from '@schemas';

import { parseIdParam, validateBody, verifyOwnership, withAuth } from '@core/api/utils';
import { db } from '@core/database/client';

import type { Asset, AssetValuation } from '@/@types/asset';

// GET /api/assets/[id] - Get a single asset with valuation history
export const GET = withAuth(async (user, _request, { params }) => {
  const id = await parseIdParam(params);
  if (id instanceof NextResponse) return id;

  const row = await verifyOwnership('assets', id, user.userId);
  if (row instanceof NextResponse) return row;

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
    args: [id],
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
}, 'Assets');

// PUT /api/assets/[id] - Update an asset (creates new valuation snapshot)
export const PUT = withAuth(async (user, request, { params }) => {
  const id = await parseIdParam(params);
  if (id instanceof NextResponse) return id;

  const currentAsset = await verifyOwnership('assets', id, user.userId);
  if (currentAsset instanceof NextResponse) return currentAsset;

  const raw = await request.json();
  const result = validateBody(createAssetSchema.partial(), raw);
  if (result instanceof NextResponse) return result;

  const body = result.data;

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
  args.push(id, user.userId);

  await db.execute({
    sql: `UPDATE assets SET ${updates.join(', ')} WHERE id = ? AND userId = ?`,
    args,
  });

  // Create valuation snapshot if values changed
  if (valuationChanged) {
    await db.execute({
      sql: `INSERT INTO assetValuations (assetId, quantity, unitValueUsd, totalValueUsd, totalValueToman, exchangeRateUsed, valuedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [id, newQuantity, newUnitValueUsd, newTotalValueUsd, newTotalValueToman, newExchangeRate, valuedAt],
    });
  }

  return NextResponse.json({ message: 'Asset updated successfully' });
}, 'Assets');

// DELETE /api/assets/[id] - Delete an asset and its valuations
export const DELETE = withAuth(async (user, _request, { params }) => {
  const id = await parseIdParam(params);
  if (id instanceof NextResponse) return id;

  // Delete asset (valuations will cascade delete due to foreign key)
  const result = await db.execute({
    sql: 'DELETE FROM assets WHERE id = ? AND userId = ?',
    args: [id, user.userId],
  });

  if (result.rowsAffected === 0) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Asset deleted successfully' });
}, 'Assets');
