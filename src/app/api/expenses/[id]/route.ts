import { getTranslations } from 'next-intl/server';
import { NextResponse } from 'next/server';

import { createExpenseSchema } from '@schemas';

import { parseIdParam, validateBody, verifyOwnership, withAuth } from '@core/api/utils';
import { db } from '@core/database/client';
import {
  buildResyncStatements,
  buildReversalStatements,
  FUNDING_ERROR_MESSAGE,
  FUNDING_ERROR_STATUS,
  planFunding,
  readFunding,
} from '@core/database/expense-funding';
import type { FundingPlanErrorReason, FundingPlanOk } from '@core/database/expense-funding';
import { syncExpenseRepeat } from '@core/database/expense-repeat';
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

  // What the expense funded before this edit, and what it should fund after.
  const before = readFunding(existing);
  const paidFromAssetId = body.paidFromAssetId ?? null;

  let after: FundingPlanOk | null = null;
  if (paidFromAssetId !== null) {
    const plan = await planFunding({
      userId: user.userId,
      assetId: paidFromAssetId,
      expense: { amount: body.amount, currency: body.currency, entryRate },
    });
    if (!plan.ok) {
      const reason: FundingPlanErrorReason = plan.reason;
      return NextResponse.json({ error: FUNDING_ERROR_MESSAGE[reason] }, { status: FUNDING_ERROR_STATUS[reason] });
    }
    after = plan;
  }

  const valuedAt = new Date().toISOString();
  const fundingStatements = await buildResyncStatements({ userId: user.userId, before, after, valuedAt });

  // The expense row and the balances it moves are written in ONE batch, so
  // there is no window in which they disagree. This single call covers every
  // edit shape: switching accounts (two ops), changing the amount (netted into
  // one), changing currency, and clearing the account (all three columns NULL).
  await db.batch(
    [
      {
        sql: `UPDATE expenses
                 SET date = ?, category_id = ?, description = ?, amount = ?, currency = ?, entryRate = ?,
                     paidFromAssetId = ?, paidFromDelta = ?, paidFromCurrency = ?
               WHERE id = ? AND user_id = ?`,
        args: [
          body.date,
          body.categoryId,
          body.description,
          body.amount,
          body.currency,
          entryRate,
          after ? after.assetId : null,
          after ? after.delta : null,
          after ? after.currency : null,
          id,
          user.userId,
        ],
      },
      ...fundingStatements,
    ],
    'write'
  );

  await assignTagsToExpense(id, body.tagIds);

  // Setting `repeat` to null here is how a user stops a repeat — there is no
  // separate rules screen. Already-posted expenses are kept either way.
  await syncExpenseRepeat({
    userId: user.userId,
    expenseId: id,
    date: body.date,
    categoryId: body.categoryId,
    description: body.description,
    amount: body.amount,
    currency: body.currency,
    tagIds: body.tagIds,
    repeat: body.repeat,
    paidFromAssetId,
    existingRecurringId: (existing.recurringId as number | null) ?? null,
  });

  return NextResponse.json({ message: 'Expense updated successfully' }, { status: 200 });
}, 'Expenses');

// DELETE /api/expenses/[id] - Delete an expense
export const DELETE = withAuth(async (user, _request, { params }) => {
  const id = await parseIdParam(params);
  if (id instanceof NextResponse) return id;

  // Read before deleting: a deleted expense must give back whatever it took out
  // of an account, and the row is the only record of how much that was. This
  // also serves as the ownership/404 check the bare DELETE used to do.
  const existing = await verifyOwnership('expenses', id, user.userId, 'user_id');
  if (existing instanceof NextResponse) return existing;

  const valuedAt = new Date().toISOString();
  const reversal = await buildReversalStatements(user.userId, readFunding(existing), valuedAt);

  await db.batch(
    [...reversal, { sql: 'DELETE FROM expenses WHERE id = ? AND user_id = ?', args: [id, user.userId] }],
    'write'
  );

  return NextResponse.json({ message: 'Expense deleted successfully' }, { status: 200 });
}, 'Expenses');
