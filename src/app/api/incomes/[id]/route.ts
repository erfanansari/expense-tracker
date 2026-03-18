import { NextResponse } from 'next/server';

import { createIncomeSchema } from '@schemas';

import { parseIdParam, validateBody, verifyOwnership, withAuth } from '@core/api/utils';
import { db } from '@core/database/client';
import { mapRowToIncome } from '@core/database/mappers';

// GET /api/incomes/[id] - Get a single income entry
export const GET = withAuth(async (user, _request, { params }) => {
  const id = await parseIdParam(params);
  if (id instanceof NextResponse) return id;

  const row = await verifyOwnership('incomes', id, user.userId);
  if (row instanceof NextResponse) return row;

  return NextResponse.json(mapRowToIncome(row));
}, 'Incomes');

// PUT /api/incomes/[id] - Update an income entry
export const PUT = withAuth(async (user, request, { params }) => {
  const id = await parseIdParam(params);
  if (id instanceof NextResponse) return id;

  const existing = await verifyOwnership('incomes', id, user.userId);
  if (existing instanceof NextResponse) return existing;

  const raw = await request.json();
  const result = validateBody(createIncomeSchema.partial(), raw);
  if (result instanceof NextResponse) return result;

  const body = result.data;

  // Build dynamic update query based on provided fields
  const updates: string[] = [];
  const args: (string | number | null)[] = [];

  if (body.amountUsd !== undefined) {
    updates.push('amountUsd = ?');
    args.push(body.amountUsd);
  }
  if (body.amountToman !== undefined) {
    updates.push('amountToman = ?');
    args.push(body.amountToman);
  }
  if (body.exchangeRateUsed !== undefined) {
    updates.push('exchangeRateUsed = ?');
    args.push(body.exchangeRateUsed);
  }
  if (body.month !== undefined) {
    updates.push('month = ?');
    args.push(body.month);
  }
  if (body.year !== undefined) {
    updates.push('year = ?');
    args.push(body.year);
  }
  if (body.incomeType !== undefined) {
    updates.push('incomeType = ?');
    args.push(body.incomeType);
  }
  if (body.source !== undefined) {
    updates.push('source = ?');
    args.push(body.source || null);
  }
  if (body.notes !== undefined) {
    updates.push('notes = ?');
    args.push(body.notes || null);
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  updates.push('updatedAt = CURRENT_TIMESTAMP');
  args.push(id, user.userId);

  await db.execute({
    sql: `UPDATE incomes SET ${updates.join(', ')} WHERE id = ? AND userId = ?`,
    args,
  });

  return NextResponse.json({ message: 'Income updated successfully' });
}, 'Incomes');

// DELETE /api/incomes/[id] - Delete an income entry
export const DELETE = withAuth(async (user, _request, { params }) => {
  const id = await parseIdParam(params);
  if (id instanceof NextResponse) return id;

  const result = await db.execute({
    sql: 'DELETE FROM incomes WHERE id = ? AND userId = ?',
    args: [id, user.userId],
  });

  if (result.rowsAffected === 0) {
    return NextResponse.json({ error: 'Income not found' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Income deleted successfully' });
}, 'Incomes');
