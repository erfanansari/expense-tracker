import { NextResponse } from 'next/server';

import { withAuth } from '@core/api/utils';
import { fetchCategoriesForExpenses } from '@core/database/categories';
import { db } from '@core/database/client';
import { mapRowToAsset, mapRowToExpense, mapRowToIncome } from '@core/database/mappers';
import { fetchTagsForExpenses } from '@core/database/tags';

export const GET = withAuth(async (user) => {
  const date = new Date().toISOString().slice(0, 10);
  const filename = `kharji-export-${date}.xlsx`;

  const [expensesResult, incomesResult, assetsResult] = await Promise.all([
    db.execute({
      sql: 'SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC, created_at DESC',
      args: [user.userId],
    }),
    db.execute({ sql: 'SELECT * FROM incomes WHERE userId = ? ORDER BY year DESC, month DESC', args: [user.userId] }),
    db.execute({ sql: 'SELECT * FROM assets WHERE userId = ? ORDER BY category, name', args: [user.userId] }),
  ]);

  const ids = expensesResult.rows.map((r) => r.id);
  const [tagsMap, categoriesMap] = await Promise.all([fetchTagsForExpenses(ids), fetchCategoriesForExpenses(ids)]);
  const expenses = expensesResult.rows
    .map((r) => {
      const cat = categoriesMap[r.id as number];
      if (!cat) return null;
      return mapRowToExpense(r, cat, tagsMap[r.id as number]);
    })
    .filter((e): e is NonNullable<typeof e> => e !== null);
  const incomes = incomesResult.rows.map(mapRowToIncome);
  const assets = assetsResult.rows.map(mapRowToAsset);

  const xlsx = await import('xlsx');

  const expenseRows = [
    ['ID', 'Date', 'Category', 'Description', 'Amount', 'Currency', 'Entry Rate (to IRT)', 'Tags', 'Created At'],
    ...expenses.map((e) => [
      e.id,
      e.date,
      e.category.name,
      e.description,
      e.amount,
      e.currency,
      e.entryRate,
      (e.tags ?? []).map((t) => t.name).join(';'),
      e.created_at,
    ]),
  ];

  const incomeRows = [
    ['ID', 'Year', 'Month', 'Type', 'Amount', 'Currency', 'Entry Rate (to IRT)', 'Source', 'Notes', 'Created At'],
    ...incomes.map((i) => [
      i.id,
      i.year,
      i.month,
      i.incomeType,
      i.amount,
      i.currency,
      i.entryRate,
      i.source ?? '',
      i.notes ?? '',
      i.createdAt,
    ]),
  ];

  const assetRows = [
    [
      'ID',
      'Category',
      'Name',
      'Quantity',
      'Unit',
      'Unit Value',
      'Total Value',
      'Currency',
      'Entry Rate (to IRT)',
      'Notes',
      'Last Valued At',
    ],
    ...assets.map((a) => [
      a.id,
      a.category,
      a.name,
      a.quantity,
      a.unit ?? '',
      a.unitValue ?? '',
      a.amount,
      a.currency,
      a.entryRate,
      a.notes ?? '',
      a.lastValuedAt,
    ]),
  ];

  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, xlsx.utils.aoa_to_sheet(expenseRows), 'Expenses');
  xlsx.utils.book_append_sheet(wb, xlsx.utils.aoa_to_sheet(incomeRows), 'Income');
  xlsx.utils.book_append_sheet(wb, xlsx.utils.aoa_to_sheet(assetRows), 'Assets');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawBuffer: any = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });
  const blob = new Blob([new Uint8Array(rawBuffer as ArrayBuffer)], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  return new NextResponse(blob, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}, 'Export');
