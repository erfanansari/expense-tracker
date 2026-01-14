import { NextResponse } from 'next/server';

import type { CreateIncomeInput, Income } from '@/@types/income';
import { INCOME_TYPES } from '@/constants/income';
import { db } from '@/core/database/client';
import { getCurrentUser } from '@/core/session/session';

// GET /api/incomes - Fetch incomes with optional year/month filters
// Query parameters:
//   - year: filter by year (optional)
//   - month: filter by month 1-12 (optional)
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let url: URL;
    try {
      url = new URL(request.url);
    } catch {
      url = new URL(request.url || '', 'http://localhost');
    }
    const { searchParams } = url;
    const yearParam = searchParams.get('year');
    const monthParam = searchParams.get('month');

    let sql = 'SELECT * FROM incomes WHERE userId = ?';
    const args: (string | number)[] = [user.userId];

    if (yearParam) {
      sql += ' AND year = ?';
      args.push(parseInt(yearParam, 10));
    }

    if (monthParam) {
      sql += ' AND month = ?';
      args.push(parseInt(monthParam, 10));
    }

    sql += ' ORDER BY year DESC, month DESC, createdAt DESC';

    const result = await db.execute({ sql, args });

    const incomes: Income[] = result.rows.map((row) => ({
      id: row.id as number,
      userId: row.userId as number,
      amountUsd: row.amountUsd as number,
      amountToman: row.amountToman as number,
      exchangeRateUsed: row.exchangeRateUsed as number,
      month: row.month as number,
      year: row.year as number,
      incomeType: row.incomeType as Income['incomeType'],
      source: row.source as string | null,
      notes: row.notes as string | null,
      createdAt: row.createdAt as string,
      updatedAt: row.updatedAt as string,
    }));

    return NextResponse.json(incomes);
  } catch (error) {
    console.error('[Incomes] Failed to fetch:', error);
    return NextResponse.json({ error: 'Failed to fetch incomes' }, { status: 500 });
  }
}

// POST /api/incomes - Create a new income entry
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateIncomeInput = await request.json();

    // Validate required fields
    if (
      body.amountUsd === undefined ||
      body.amountToman === undefined ||
      body.exchangeRateUsed === undefined ||
      !body.month ||
      !body.year ||
      !body.incomeType
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate numbers
    if (
      typeof body.amountUsd !== 'number' ||
      typeof body.amountToman !== 'number' ||
      typeof body.exchangeRateUsed !== 'number'
    ) {
      return NextResponse.json({ error: 'Amounts and exchange rate must be numbers' }, { status: 400 });
    }

    // Validate month range
    if (body.month < 1 || body.month > 12) {
      return NextResponse.json({ error: 'Month must be between 1 and 12' }, { status: 400 });
    }

    // Validate income type
    const validTypes = INCOME_TYPES.map((t) => t.value);
    if (!validTypes.includes(body.incomeType)) {
      return NextResponse.json({ error: 'Invalid income type' }, { status: 400 });
    }

    const result = await db.execute({
      sql: `INSERT INTO incomes (userId, amountUsd, amountToman, exchangeRateUsed, month, year, incomeType, source, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
      args: [
        user.userId,
        body.amountUsd,
        body.amountToman,
        body.exchangeRateUsed,
        body.month,
        body.year,
        body.incomeType,
        body.source || null,
        body.notes || null,
      ],
    });

    const incomeId = result.rows[0].id as number;

    return NextResponse.json({ message: 'Income created successfully', id: incomeId }, { status: 201 });
  } catch (error) {
    console.error('[Incomes] Failed to create:', error);
    return NextResponse.json({ error: 'Failed to create income' }, { status: 500 });
  }
}
