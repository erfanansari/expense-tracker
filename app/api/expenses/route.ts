import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { type CreateExpenseInput, type Expense } from '@/lib/types/expense';

// GET /api/expenses - Fetch all expenses
export async function GET() {
  try {
    const result = await db.execute('SELECT * FROM expenses ORDER BY date DESC, created_at DESC');

    const expenses: Expense[] = result.rows.map((row) => ({
      id: row.id as number,
      date: row.date as string,
      category: row.category as string,
      description: row.description as string,
      price_toman: row.price_toman as number,
      price_usd: row.price_usd as number,
      created_at: row.created_at as string,
    }));

    return NextResponse.json(expenses);
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

    // Insert the expense
    await db.execute({
      sql: 'INSERT INTO expenses (date, category, description, price_toman, price_usd) VALUES (?, ?, ?, ?, ?)',
      args: [body.date, body.category, body.description, body.price_toman, body.price_usd]
    });

    return NextResponse.json(
      { message: 'Expense created successfully' },
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
