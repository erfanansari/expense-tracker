import { NextResponse } from 'next/server';

import { withAuth } from '@core/api/utils';
import { db } from '@core/database/client';

import type { AssetCategory } from '@/@types/asset';

// All monetary values in this response are in the pivot currency (IRT). Each
// record's pivot value is amount * entryRate (its frozen historical value).
// The client converts to the user's primary/secondary currency for display.
interface MonthlySummary {
  month: number;
  year: number;
  income: number;
  expenses: number;
}

interface CategorySummary {
  category: AssetCategory;
  value: number;
  percentage: number;
}

interface SummaryResponse {
  current_month_income: number;
  current_month_expenses: number;
  total_income: number;
  total_expenses: number;
  total_assets: number;
  net_worth: number;
  income_vs_expenses: MonthlySummary[];
  assets_by_category: CategorySummary[];
}

const num = (v: unknown): number => (typeof v === 'number' ? v : 0);

// GET /api/summary - Get financial overview for dashboard (all values in pivot/IRT)
export const GET = withAuth(async (user) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const currentIncomeResult = await db.execute({
    sql: `SELECT COALESCE(SUM(amount * entryRate), 0) as total
          FROM incomes WHERE userId = ? AND month = ? AND year = ?`,
    args: [user.userId, currentMonth, currentYear],
  });
  const currentMonthIncome = num(currentIncomeResult.rows[0]?.total);

  const totalIncomeResult = await db.execute({
    sql: `SELECT COALESCE(SUM(amount * entryRate), 0) as total FROM incomes WHERE userId = ?`,
    args: [user.userId],
  });
  const totalIncome = num(totalIncomeResult.rows[0]?.total);

  const startOfMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
  const endOfMonth = new Date(currentYear, currentMonth, 0);
  const endOfMonthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(endOfMonth.getDate()).padStart(2, '0')}`;

  const currentExpensesResult = await db.execute({
    sql: `SELECT COALESCE(SUM(amount * entryRate), 0) as total
          FROM expenses WHERE user_id = ? AND date >= ? AND date <= ?`,
    args: [user.userId, startOfMonth, endOfMonthStr],
  });
  const currentMonthExpenses = num(currentExpensesResult.rows[0]?.total);

  const totalExpensesResult = await db.execute({
    sql: `SELECT COALESCE(SUM(amount * entryRate), 0) as total FROM expenses WHERE user_id = ?`,
    args: [user.userId],
  });
  const totalExpenses = num(totalExpensesResult.rows[0]?.total);

  const assetsResult = await db.execute({
    sql: `SELECT COALESCE(SUM(amount * entryRate), 0) as total FROM assets WHERE userId = ?`,
    args: [user.userId],
  });
  const totalAssets = num(assetsResult.rows[0]?.total);

  // Net worth = total assets (no liabilities tracked yet)
  const netWorth = totalAssets;

  // Income vs expenses for the last 6 months
  const months: { month: number; year: number; start: string; end: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentYear, currentMonth - 1 - i, 1);
    const m = date.getMonth() + 1;
    const y = date.getFullYear();
    const lastDay = new Date(y, m, 0).getDate();
    months.push({
      month: m,
      year: y,
      start: `${y}-${String(m).padStart(2, '0')}-01`,
      end: `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
    });
  }

  const monthYearConditions = months.map(() => '(month = ? AND year = ?)').join(' OR ');
  const monthYearArgs = months.flatMap((m) => [m.month, m.year]);

  const incomeByMonthResult = await db.execute({
    sql: `SELECT month, year, COALESCE(SUM(amount * entryRate), 0) as total
          FROM incomes WHERE userId = ? AND (${monthYearConditions})
          GROUP BY month, year`,
    args: [user.userId, ...monthYearArgs],
  });

  const oldestStart = months[0].start;
  const newestEnd = months[months.length - 1].end;

  const expensesByMonthResult = await db.execute({
    sql: `SELECT
            CAST(SUBSTR(date, 6, 2) AS INTEGER) as month,
            CAST(SUBSTR(date, 1, 4) AS INTEGER) as year,
            COALESCE(SUM(amount * entryRate), 0) as total
          FROM expenses
          WHERE user_id = ? AND date >= ? AND date <= ?
          GROUP BY SUBSTR(date, 1, 7)`,
    args: [user.userId, oldestStart, newestEnd],
  });

  const incomeMap = new Map<string, number>();
  incomeByMonthResult.rows.forEach((row) => incomeMap.set(`${row.year}-${row.month}`, num(row.total)));

  const expenseMap = new Map<string, number>();
  expensesByMonthResult.rows.forEach((row) => expenseMap.set(`${row.year}-${row.month}`, num(row.total)));

  const incomeVsExpenses: MonthlySummary[] = months.map((m) => ({
    month: m.month,
    year: m.year,
    income: incomeMap.get(`${m.year}-${m.month}`) ?? 0,
    expenses: expenseMap.get(`${m.year}-${m.month}`) ?? 0,
  }));

  const categoryResult = await db.execute({
    sql: `SELECT category, COALESCE(SUM(amount * entryRate), 0) as value
          FROM assets WHERE userId = ?
          GROUP BY category ORDER BY value DESC`,
    args: [user.userId],
  });

  const assetsByCategory: CategorySummary[] = categoryResult.rows.map((row) => ({
    category: row.category as AssetCategory,
    value: num(row.value),
    percentage: totalAssets > 0 ? (num(row.value) / totalAssets) * 100 : 0,
  }));

  const response: SummaryResponse = {
    current_month_income: currentMonthIncome,
    current_month_expenses: currentMonthExpenses,
    total_income: totalIncome,
    total_expenses: totalExpenses,
    total_assets: totalAssets,
    net_worth: netWorth,
    income_vs_expenses: incomeVsExpenses,
    assets_by_category: assetsByCategory,
  };

  return NextResponse.json(response);
}, 'Summary');
