import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { getCurrentUser } from '@/lib/session';
import { type CreateExpenseInput, type Expense } from '@/lib/types/expense';

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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
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

    // Backward compatibility: if no limit is specified, return all expenses in old format (array)
    // This is used by the page component for stats and charts
    if (!limitParam || limitParam === '') {
      const result = await db.execute({
        sql: 'SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC, created_at DESC',
        args: [user.userId]
      });

      // Fetch tags for all expenses
      const expenseIds = result.rows.map(row => row.id);
      let tagsMap: Record<number, any[]> = {};

      if (expenseIds.length > 0) {
        const placeholders = expenseIds.map(() => '?').join(',');
        const tagsResult = await db.execute({
          sql: `
            SELECT et.expense_id, t.id, t.name, t.created_at
            FROM expense_tags et
            JOIN tags t ON et.tag_id = t.id
            WHERE et.expense_id IN (${placeholders})
          `,
          args: expenseIds
        });

        // Group tags by expense_id
        tagsResult.rows.forEach((row: any) => {
          if (!tagsMap[row.expense_id]) {
            tagsMap[row.expense_id] = [];
          }
          tagsMap[row.expense_id].push({
            id: row.id,
            name: row.name,
            created_at: row.created_at
          });
        });
      }

      const expenses: Expense[] = result.rows.map((row) => ({
        id: row.id as number,
        date: row.date as string,
        category: row.category as string,
        description: row.description as string,
        price_toman: row.price_toman as number,
        price_usd: row.price_usd as number,
        created_at: row.created_at as string,
        tags: tagsMap[row.id as number] || []
      }));

      return NextResponse.json(expenses);
    }

    // Paginated response
    const limit = Math.min(parseInt(limitParam, 10), 100); // Max 100 items per request

    let sql = 'SELECT * FROM expenses WHERE user_id = ?';
    const args: any[] = [user.userId];

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
    const expenseIds = expensesToReturn.map(row => row.id);
    let tagsMap: Record<number, any[]> = {};

    if (expenseIds.length > 0) {
      const placeholders = expenseIds.map(() => '?').join(',');
      const tagsResult = await db.execute({
        sql: `
          SELECT et.expense_id, t.id, t.name, t.created_at
          FROM expense_tags et
          JOIN tags t ON et.tag_id = t.id
          WHERE et.expense_id IN (${placeholders})
        `,
        args: expenseIds
      });

      // Group tags by expense_id
      tagsResult.rows.forEach((row: any) => {
        if (!tagsMap[row.expense_id]) {
          tagsMap[row.expense_id] = [];
        }
        tagsMap[row.expense_id].push({
          id: row.id,
          name: row.name,
          created_at: row.created_at
        });
      });
    }

    const expenses: Expense[] = expensesToReturn.map((row) => ({
      id: row.id as number,
      date: row.date as string,
      category: row.category as string,
      description: row.description as string,
      price_toman: row.price_toman as number,
      price_usd: row.price_usd as number,
      created_at: row.created_at as string,
      tags: tagsMap[row.id as number] || []
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
      hasMore
    });
  } catch (error) {
    console.error('Failed to fetch expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

// POST /api/expenses - Create a new expense
export async function POST(request: Request) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: CreateExpenseInput = await request.json();

    // Validate required fields
    if (!body.date || !body.category || !body.description || body.price_toman === undefined || body.price_usd === undefined) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate numbers
    if (typeof body.price_toman !== 'number' || typeof body.price_usd !== 'number') {
      return NextResponse.json(
        { error: 'Prices must be numbers' },
        { status: 400 }
      );
    }

    // Insert the expense with user_id
    const expenseResult = await db.execute({
      sql: 'INSERT INTO expenses (user_id, date, category, description, price_toman, price_usd) VALUES (?, ?, ?, ?, ?, ?) RETURNING id',
      args: [user.userId, body.date, body.category, body.description, body.price_toman, body.price_usd]
    });

    const expenseId = expenseResult.rows[0].id as number;

    // Insert tags if provided
    if (body.tagIds && body.tagIds.length > 0) {
      for (const tagId of body.tagIds) {
        await db.execute({
          sql: 'INSERT INTO expense_tags (expense_id, tag_id) VALUES (?, ?)',
          args: [expenseId, tagId]
        });
      }
    }

    return NextResponse.json(
      { message: 'Expense created successfully', id: expenseId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}
