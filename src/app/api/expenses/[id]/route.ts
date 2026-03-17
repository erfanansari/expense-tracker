import { NextResponse } from 'next/server';

import { createExpenseSchema } from '@schemas';

import { parseIdParam, validateBody, verifyOwnership, withAuth } from '@core/api/utils';
import { db } from '@core/database/client';
import { assignTagsToExpense } from '@core/database/tags';

// PUT /api/expenses/[id] - Update an expense
export const PUT = withAuth(async (user, request, { params }) => {
  const id = await parseIdParam(params);
  if (id instanceof NextResponse) return id;

  const existing = await verifyOwnership('expenses', id, user.userId, 'user_id');
  if (existing instanceof NextResponse) return existing;

  const raw = await request.json();
  const result = validateBody(createExpenseSchema, raw);
  if (result instanceof NextResponse) return result;

  const body = result.data;

  // Update the expense
  await db.execute({
    sql: `UPDATE expenses
          SET date = ?, category = ?, description = ?, price_toman = ?, price_usd = ?
          WHERE id = ? AND user_id = ?`,
    args: [body.date, body.category, body.description, body.price_toman, body.price_usd, id, user.userId],
  });

  // Update tags - delete existing and insert new ones
  await assignTagsToExpense(id, body.tagIds);

  return NextResponse.json({ message: 'Expense updated successfully' }, { status: 200 });
}, 'Expenses');

// DELETE /api/expenses/[id] - Delete an expense
export const DELETE = withAuth(async (user, _request, { params }) => {
  const id = await parseIdParam(params);
  if (id instanceof NextResponse) return id;

  const result = await db.execute({
    sql: 'DELETE FROM expenses WHERE id = ? AND user_id = ?',
    args: [id, user.userId],
  });

  if (result.rowsAffected === 0) {
    return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Expense deleted successfully' }, { status: 200 });
}, 'Expenses');
