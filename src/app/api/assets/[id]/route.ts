import { getTranslations } from 'next-intl/server';
import { NextResponse } from 'next/server';

import { createAssetSchema } from '@schemas';

import { parseIdParam, validateBody, verifyOwnership, withAuth } from '@core/api/utils';
import { db } from '@core/database/client';
import { mapRowToAsset, mapRowToAssetValuation } from '@core/database/mappers';
import { getEntryRate } from '@core/rates';

// GET /api/assets/[id] - Get a single asset with valuation history
export const GET = withAuth(async (user, _request, { params }) => {
  const id = await parseIdParam(params);
  if (id instanceof NextResponse) return id;

  const row = await verifyOwnership('assets', id, user.userId);
  if (row instanceof NextResponse) return row;

  // Get valuation history (last 30 entries)
  const valuationsResult = await db.execute({
    sql: `SELECT * FROM assetValuations
          WHERE assetId = ?
          ORDER BY valuedAt DESC
          LIMIT 30`,
    args: [id],
  });

  return NextResponse.json({
    asset: mapRowToAsset(row),
    valuations: valuationsResult.rows.map(mapRowToAssetValuation),
  });
}, 'Assets');

// PUT /api/assets/[id] - Update an asset (creates new valuation snapshot)
export const PUT = withAuth(async (user, request, { params }) => {
  const id = await parseIdParam(params);
  if (id instanceof NextResponse) return id;

  const currentAsset = await verifyOwnership('assets', id, user.userId);
  if (currentAsset instanceof NextResponse) return currentAsset;

  const raw = await request.json();
  const t = await getTranslations();
  const result = validateBody(createAssetSchema(t).partial(), raw);
  if (result instanceof NextResponse) return result;

  const body = result.data;

  // Build dynamic update query
  const updates: string[] = [];
  const args: (string | number | null)[] = [];

  // Track if the valuation changed (amount/currency/quantity/unitValue) for a snapshot.
  let valuationChanged = false;
  const newQuantity = body.quantity ?? (currentAsset.quantity as number);
  const newUnitValue = body.unitValue ?? (currentAsset.unitValue as number | null);
  const newAmount = body.amount ?? (currentAsset.amount as number);
  const newCurrency = body.currency ?? (currentAsset.currency as string);

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

  if (body.unitValue !== undefined) {
    updates.push('unitValue = ?');
    args.push(body.unitValue);
    if (body.unitValue !== currentAsset.unitValue) valuationChanged = true;
  }

  if (body.amount !== undefined) {
    updates.push('amount = ?');
    args.push(body.amount);
    if (body.amount !== currentAsset.amount) valuationChanged = true;
  }

  if (body.currency !== undefined && body.currency !== currentAsset.currency) {
    valuationChanged = true;
  }

  if (body.notes !== undefined) {
    updates.push('notes = ?');
    args.push(body.notes || null);
  }

  if (body.lastValuedAt !== undefined) {
    updates.push('lastValuedAt = ?');
    args.push(body.lastValuedAt);
  }

  // Re-snapshot the entry rate whenever the valuation changes (rate at this valuation time).
  let newEntryRate = currentAsset.entryRate as number;
  if (valuationChanged) {
    const rate = await getEntryRate(newCurrency);
    if (rate === null) {
      return NextResponse.json({ error: `No exchange rate available for ${newCurrency}` }, { status: 422 });
    }
    newEntryRate = rate;
    updates.push('currency = ?', 'entryRate = ?');
    args.push(newCurrency, newEntryRate);
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
      sql: `INSERT INTO assetValuations (assetId, quantity, unitValue, amount, currency, entryRate, valuedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [id, newQuantity, newUnitValue, newAmount, newCurrency, newEntryRate, valuedAt],
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
