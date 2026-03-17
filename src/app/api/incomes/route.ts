import { NextResponse } from 'next/server';

import { createIncomeSchema } from '@schemas';

import { db } from '@core/database/client';
import { getCurrentUser } from '@core/session/session';

import type { Income } from '@/@types/income';

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

    const raw = await request.json();
    const parsed = createIncomeSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const body = parsed.data;

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
