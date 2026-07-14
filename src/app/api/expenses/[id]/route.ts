import { getTranslations } from 'next-intl/server';
import { NextResponse } from 'next/server';

import { createExpenseSchema } from '@schemas';

import { parseIdParam, validateBody, verifyOwnership, withAuth } from '@core/api/utils';
import { db } from '@core/database/client';
import { assignTagsToExpense } from '@core/database/tags';
import { getEntryRate } from '@core/rates';

// PUT /api/expenses/[id] - Update an expense
export const PUT = withAuth(async (user, request, { params }) => {
  const id = await parseIdParam(params);
  if (id instanceof NextResponse) return id;

  const existing = await verifyOwnership('expenses', id, user.userId, 'user_id');
  if (existing instanceof NextResponse) return existing;

  const raw = await request.json();
  const t = await getTranslations();
  const result = validateBody(createExpenseSchema(t), raw);
  if (result instanceof NextResponse) return result;

  const body = result.data;

  // Verify the category belongs to this user
  const category = await verifyOwnership('categories', body.categoryId, user.userId, 'user_id');
  if (category instanceof NextResponse) return category;

  // Re-snapshot the entry rate for the (possibly changed) currency.
  const entryRate = await getEntryRate(body.currency);
  if (entryRate === null) {
    return NextResponse.json({ error: `No exchange rate available for ${body.currency}` }, { status: 422 });
  }

  await db.execute({
    sql: `UPDATE expenses
          SET date = ?, category_id = ?, description = ?, amount = ?, currency = ?, entryRate = ?
          WHERE id = ? AND user_id = ?`,
    args: [body.date, body.categoryId, body.description, body.amount, body.currency, entryRate, id, user.userId],
  });

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
