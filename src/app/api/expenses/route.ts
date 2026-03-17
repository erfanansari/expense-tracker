import { NextResponse } from 'next/server';

import { createExpenseSchema } from '@schemas';

import { db } from '@core/database/client';
import { fetchTagsForExpenses } from '@core/database/tags';
import { getCurrentUser } from '@core/session/session';

import { type Expense } from '@/@types/expense';

// GET /api/expenses - Fetch expenses with pagination support
// Query parameters:
//   - limit: number of expenses to fetch (default: all expenses, for backward compatibility)
//   - cursor: pagination cursor in format "date:created_at:id" (optional)
// If limit is not provided, returns all expenses in the old format (backward compatible)
// If limit is provided, returns paginated format: { expenses, nextCursor, hasMore }
export async function GET(request: Request) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Handle both Request object and edge cases
    let url: URL;
    try {
      url = new URL(request.url);
    } catch {
      // Fallback if URL parsing fails
      url = new URL(request.url || '', 'http://localhost');
    }
    const { searchParams } = url;
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

      const expenses: Expense[] = result.rows.map((row) => ({
        id: row.id as number,
        date: row.date as string,
        category: row.category as string,
        description: row.description as string,
        price_toman: row.price_toman as number,
        price_usd: row.price_usd as number,
        created_at: row.created_at as string,
        tags: tagsMap[row.id as number] || [],
      }));

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
    // Since we order by date DESC, created_at DESC, id DESC, we want items that come after the cursor
    // This means: date < cursor_date OR (date = cursor_date AND created_at < cursor_created_at) OR (date = cursor_date AND created_at = cursor_created_at AND id < cursor_id)
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

    const expenses: Expense[] = expensesToReturn.map((row) => ({
      id: row.id as number,
      date: row.date as string,
      category: row.category as string,
      description: row.description as string,
      price_toman: row.price_toman as number,
      price_usd: row.price_usd as number,
      created_at: row.created_at as string,
      tags: tagsMap[row.id as number] || [],
    }));

    // Generate next cursor from the last item
    // Format: "date:created_at:id"
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
  } catch (error) {
    console.error('Failed to fetch expenses:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

// POST /api/expenses - Create a new expense
export async function POST(request: Request) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const raw = await request.json();
    const parsed = createExpenseSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const body = parsed.data;

    // Insert the expense with user_id
    const expenseResult = await db.execute({
      sql: 'INSERT INTO expenses (user_id, date, category, description, price_toman, price_usd) VALUES (?, ?, ?, ?, ?, ?) RETURNING id',
      args: [user.userId, body.date, body.category, body.description, body.price_toman, body.price_usd],
    });

    const expenseId = expenseResult.rows[0].id as number;

    // Insert tags if provided
    if (body.tagIds && body.tagIds.length > 0) {
      for (const tagId of body.tagIds) {
        await db.execute({
          sql: 'INSERT INTO expense_tags (expense_id, tag_id) VALUES (?, ?)',
          args: [expenseId, tagId],
        });
      }
    }

    return NextResponse.json({ message: 'Expense created successfully', id: expenseId }, { status: 201 });
  } catch (error) {
    console.error('Failed to create expense:', error);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}
