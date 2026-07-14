import { getTranslations } from 'next-intl/server';
import { NextResponse } from 'next/server';

import { createIncomeSchema } from '@schemas';

import { getSearchParams, validateBody, withAuth } from '@core/api/utils';
import { db } from '@core/database/client';
import { mapRowToIncome } from '@core/database/mappers';
import { getEntryRate } from '@core/rates';

// GET /api/incomes - Fetch incomes with optional year/month filters
export const GET = withAuth(async (user, request) => {
  const searchParams = getSearchParams(request);
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

  return NextResponse.json(result.rows.map(mapRowToIncome));
}, 'Incomes');

// POST /api/incomes - Create a new income entry
export const POST = withAuth(async (user, request) => {
  const raw = await request.json();
  const t = await getTranslations();
  const result = validateBody(createIncomeSchema(t), raw);
  if (result instanceof NextResponse) return result;

  const body = result.data;

  const entryRate = await getEntryRate(body.currency);
  if (entryRate === null) {
    return NextResponse.json({ error: `No exchange rate available for ${body.currency}` }, { status: 422 });
  }

  const dbResult = await db.execute({
    sql: `INSERT INTO incomes (userId, amount, currency, entryRate, month, year, incomeType, source, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
    args: [
      user.userId,
      body.amount,
      body.currency,
      entryRate,
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
