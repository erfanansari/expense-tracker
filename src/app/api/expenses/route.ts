import { NextResponse } from 'next/server';

import { createExpenseSchema } from '@schemas';

import { getSearchParams, validateBody, verifyOwnership, withAuth } from '@core/api/utils';
import { fetchCategoriesForExpenses } from '@core/database/categories';
import { db } from '@core/database/client';
import { mapRowToExpense } from '@core/database/mappers';
import { assignTagsToExpense, fetchTagsForExpenses } from '@core/database/tags';
import { getEntryRate } from '@core/rates';

// GET /api/expenses - Fetch expenses with pagination support
// Query parameters:
//   - limit: number of expenses to fetch (default: all expenses, for backward compatibility)
//   - cursor: pagination cursor in format "date:created_at:id" (optional)
//   - categoryId: filter by category id
// If limit is not provided, returns all expenses in the old format (backward compatible)
// If limit is provided, returns paginated format: { expenses, nextCursor, hasMore }
export const GET = withAuth(async (user, request) => {
  const searchParams = getSearchParams(request);
  const limitParam = searchParams.get('limit');
  const cursor = searchParams.get('cursor');
  const description = searchParams.get('description')?.trim() || null;
  const categoryIdParam = searchParams.get('categoryId')?.trim() || null;
  const categoryId = categoryIdParam ? Number(categoryIdParam) : null;
  const dateFrom = searchParams.get('dateFrom')?.trim() || null;
  const dateTo = searchParams.get('dateTo')?.trim() || null;
  const tagIdsParam = searchParams.get('tagIds')?.trim() || null;
  const tagIds = tagIdsParam ? tagIdsParam.split(',').map(Number).filter(Boolean) : [];

  // Backward compatibility: if no limit is specified, return all expenses
  if (!limitParam || limitParam === '') {
    const result = await db.execute({
      sql: 'SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC, created_at DESC',
      args: [user.userId],
    });

    const ids = result.rows.map((row) => row.id);
    const [tagsMap, categoriesMap] = await Promise.all([fetchTagsForExpenses(ids), fetchCategoriesForExpenses(ids)]);
    const expenses = result.rows
      .map((row) => {
        const cat = categoriesMap[row.id as number];
        if (!cat) return null;
        return mapRowToExpense(row, cat, tagsMap[row.id as number]);
      })
      .filter((e): e is NonNullable<typeof e> => e !== null);

    return NextResponse.json(expenses);
  }

  // Paginated response
  const limit = Math.min(parseInt(limitParam, 10), 100); // Max 100 items per request

  let sql = 'SELECT * FROM expenses WHERE user_id = ?';
  const args: (string | number)[] = [user.userId];

  if (description) {
    sql += ' AND description LIKE ?';
    args.push(`%${description}%`);
  }
  if (categoryId) {
    sql += ' AND category_id = ?';
    args.push(categoryId);
  }
  if (dateFrom) {
    sql += ' AND date >= ?';
    args.push(dateFrom);
  }
  if (dateTo) {
    sql += ' AND date <= ?';
    args.push(dateTo);
  }
  if (tagIds.length > 0) {
    sql += ` AND EXISTS (SELECT 1 FROM expense_tags et WHERE et.expense_id = expenses.id AND et.tag_id IN (${tagIds.map(() => '?').join(',')}))`;
    args.push(...tagIds);
  }

  if (cursor) {
    const [cursorDate, cursorCreatedAt, cursorId] = cursor.split(':');
    sql += ` AND (date < ? OR (date = ? AND created_at < ?) OR (date = ? AND created_at = ? AND id < ?))`;
    args.push(cursorDate, cursorDate, cursorCreatedAt, cursorDate, cursorCreatedAt, parseInt(cursorId, 10));
  }

  sql += ' ORDER BY date DESC, created_at DESC, id DESC LIMIT ?';
  args.push(limit + 1);

  const result = await db.execute({ sql, args });

  const hasMore = result.rows.length > limit;
  const expensesToReturn = hasMore ? result.rows.slice(0, limit) : result.rows;

  const ids = expensesToReturn.map((row) => row.id);
  const [tagsMap, categoriesMap] = await Promise.all([fetchTagsForExpenses(ids), fetchCategoriesForExpenses(ids)]);
  const expenses = expensesToReturn
    .map((row) => {
      const cat = categoriesMap[row.id as number];
      if (!cat) return null;
      return mapRowToExpense(row, cat, tagsMap[row.id as number]);
    })
    .filter((e): e is NonNullable<typeof e> => e !== null);

  let nextCursor: string | null = null;
  if (hasMore && expenses.length > 0) {
    const lastExpense = expenses[expenses.length - 1];
    nextCursor = `${lastExpense.date}:${lastExpense.created_at}:${lastExpense.id}`;
  }

  return NextResponse.json({
    expenses,
    nextCursor,
    hasMore,
  });
}, 'Expenses');

// POST /api/expenses - Create a new expense
export const POST = withAuth(async (user, request) => {
  const raw = await request.json();
  const result = validateBody(createExpenseSchema, raw);
  if (result instanceof NextResponse) return result;

  const body = result.data;

  // Verify the category belongs to this user
  const category = await verifyOwnership('categories', body.categoryId, user.userId, 'user_id');
  if (category instanceof NextResponse) return category;

  // Snapshot the rate to the pivot at entry time so the value stays historically exact.
  const entryRate = await getEntryRate(body.currency);
  if (entryRate === null) {
    return NextResponse.json({ error: `No exchange rate available for ${body.currency}` }, { status: 422 });
  }

  const expenseResult = await db.execute({
    sql: 'INSERT INTO expenses (user_id, date, category_id, description, amount, currency, entryRate) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id',
    args: [user.userId, body.date, body.categoryId, body.description, body.amount, body.currency, entryRate],
  });

  const expenseId = expenseResult.rows[0].id as number;

  await assignTagsToExpense(expenseId, body.tagIds);

  return NextResponse.json({ message: 'Expense created successfully', id: expenseId }, { status: 201 });
}, 'Expenses');
