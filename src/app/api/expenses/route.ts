import { NextResponse } from 'next/server';

import { createExpenseSchema } from '@schemas';

import { getSearchParams, validateBody, withAuth } from '@core/api/utils';
import { db } from '@core/database/client';
import { mapRowToExpense } from '@core/database/mappers';
import { assignTagsToExpense, fetchTagsForExpenses } from '@core/database/tags';

// GET /api/expenses - Fetch expenses with pagination support
// Query parameters:
//   - limit: number of expenses to fetch (default: all expenses, for backward compatibility)
//   - cursor: pagination cursor in format "date:created_at:id" (optional)
// If limit is not provided, returns all expenses in the old format (backward compatible)
// If limit is provided, returns paginated format: { expenses, nextCursor, hasMore }
export const GET = withAuth(async (user, request) => {
  const searchParams = getSearchParams(request);
  const limitParam = searchParams.get('limit');
  const cursor = searchParams.get('cursor');
  const description = searchParams.get('description')?.trim() || null;
  const category = searchParams.get('category')?.trim() || null;
  const dateFrom = searchParams.get('dateFrom')?.trim() || null;
  const dateTo = searchParams.get('dateTo')?.trim() || null;

  // Backward compatibility: if no limit is specified, return all expenses in old format (array)
  // This is used by the page component for stats and charts
  if (!limitParam || limitParam === '') {
    const result = await db.execute({
      sql: 'SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC, created_at DESC',
      args: [user.userId],
    });

    // Fetch tags for all expenses
    const tagsMap = await fetchTagsForExpenses(result.rows.map((row) => row.id));
    const expenses = result.rows.map((row) => mapRowToExpense(row, tagsMap[row.id as number]));

    return NextResponse.json(expenses);
  }

  // Paginated response
  const limit = Math.min(parseInt(limitParam, 10), 100); // Max 100 items per request

  let sql = 'SELECT * FROM expenses WHERE user_id = ?';
  const args: (string | number)[] = [user.userId];

  // Apply text/category/date filters
  if (description) {
    sql += ' AND description LIKE ?';
    args.push(`%${description}%`);
  }
  if (category) {
    sql += ' AND category = ?';
    args.push(category);
  }
  if (dateFrom) {
    sql += ' AND date >= ?';
    args.push(dateFrom);
  }
  if (dateTo) {
    sql += ' AND date <= ?';
    args.push(dateTo);
  }

  // Apply cursor-based pagination
  if (cursor) {
    const [cursorDate, cursorCreatedAt, cursorId] = cursor.split(':');
    sql += ` AND (date < ? OR (date = ? AND created_at < ?) OR (date = ? AND created_at = ? AND id < ?))`;
    args.push(cursorDate, cursorDate, cursorCreatedAt, cursorDate, cursorCreatedAt, parseInt(cursorId, 10));
  }

  sql += ' ORDER BY date DESC, created_at DESC, id DESC LIMIT ?';
  args.push(limit + 1); // Fetch one extra to check if there's a next page

  const result = await db.execute({ sql, args });

  // Check if there are more items
  const hasMore = result.rows.length > limit;
  const expensesToReturn = hasMore ? result.rows.slice(0, limit) : result.rows;

  // Fetch tags for all expenses
  const tagsMap = await fetchTagsForExpenses(expensesToReturn.map((row) => row.id));
  const expenses = expensesToReturn.map((row) => mapRowToExpense(row, tagsMap[row.id as number]));

  // Generate next cursor from the last item
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

  // Insert the expense with user_id
  const expenseResult = await db.execute({
    sql: 'INSERT INTO expenses (user_id, date, category, description, price_toman, price_usd) VALUES (?, ?, ?, ?, ?, ?) RETURNING id',
    args: [user.userId, body.date, body.category, body.description, body.price_toman, body.price_usd],
  });

  const expenseId = expenseResult.rows[0].id as number;

  // Insert tags if provided
  await assignTagsToExpense(expenseId, body.tagIds);

  return NextResponse.json({ message: 'Expense created successfully', id: expenseId }, { status: 201 });
}, 'Expenses');
