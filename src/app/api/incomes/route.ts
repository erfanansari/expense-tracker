import { NextResponse } from 'next/server';

import { createIncomeSchema } from '@schemas';

import { validateBody, withAuth } from '@core/api/utils';
import { db } from '@core/database/client';

import type { Income } from '@/@types/income';

// GET /api/incomes - Fetch incomes with optional year/month filters
export const GET = withAuth(async (user, request) => {
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
}, 'Incomes');

// POST /api/incomes - Create a new income entry
export const POST = withAuth(async (user, request) => {
  const raw = await request.json();
  const result = validateBody(createIncomeSchema, raw);
  if (result instanceof NextResponse) return result;

  const body = result.data;

  const dbResult = await db.execute({
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

  const incomeId = dbResult.rows[0].id as number;

  return NextResponse.json({ message: 'Income created successfully', id: incomeId }, { status: 201 });
}, 'Incomes');
