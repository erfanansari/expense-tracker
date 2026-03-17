import { NextResponse } from 'next/server';

import { db } from '@core/database/client';
import { getCurrentUser } from '@core/session/session';

import type { AssetCategory } from '@/@types/asset';

interface MonthlySummary {
  month: number;
  year: number;
  incomeUsd: number;
  incomeToman: number;
  expensesUsd: number;
  expensesToman: number;
}

interface CategorySummary {
  category: AssetCategory;
  valueUsd: number;
  valueToman: number;
  percentage: number;
}

interface SummaryResponse {
  current_month_income_usd: number;
  current_month_income_toman: number;
  current_month_expenses_usd: number;
  current_month_expenses_toman: number;
  total_income_usd: number;
  total_income_toman: number;
  total_expenses_usd: number;
  total_expenses_toman: number;
  total_assets_usd: number;
  total_assets_toman: number;
  net_worth_usd: number;
  net_worth_toman: number;
  income_vs_expenses: MonthlySummary[];
  assets_by_category: CategorySummary[];
}

// GET /api/summary - Get financial overview for dashboard
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Get current month income
    const currentIncomeResult = await db.execute({
      sql: `SELECT COALESCE(SUM(amountUsd), 0) as totalUsd, COALESCE(SUM(amountToman), 0) as totalToman
            FROM incomes
            WHERE userId = ? AND month = ? AND year = ?`,
      args: [user.userId, currentMonth, currentYear],
    });

    const currentMonthIncomeUsd = (currentIncomeResult.rows[0]?.totalUsd as number) || 0;
    const currentMonthIncomeToman = (currentIncomeResult.rows[0]?.totalToman as number) || 0;

    // Get total income (all-time)
    const totalIncomeResult = await db.execute({
      sql: `SELECT COALESCE(SUM(amountUsd), 0) as totalUsd, COALESCE(SUM(amountToman), 0) as totalToman
            FROM incomes
            WHERE userId = ?`,
      args: [user.userId],
    });

    const totalIncomeUsd = (totalIncomeResult.rows[0]?.totalUsd as number) || 0;
    const totalIncomeToman = (totalIncomeResult.rows[0]?.totalToman as number) || 0;

    // Get current month expenses
    const startOfMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    const endOfMonth = new Date(currentYear, currentMonth, 0);
    const endOfMonthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(endOfMonth.getDate()).padStart(2, '0')}`;

    const currentExpensesResult = await db.execute({
      sql: `SELECT COALESCE(SUM(price_usd), 0) as totalUsd, COALESCE(SUM(price_toman), 0) as totalToman
            FROM expenses
            WHERE user_id = ? AND date >= ? AND date <= ?`,
      args: [user.userId, startOfMonth, endOfMonthStr],
    });

    const currentMonthExpensesUsd = (currentExpensesResult.rows[0]?.totalUsd as number) || 0;
    const currentMonthExpensesToman = (currentExpensesResult.rows[0]?.totalToman as number) || 0;

    // Get total expenses (all-time)
    const totalExpensesResult = await db.execute({
      sql: `SELECT COALESCE(SUM(price_usd), 0) as totalUsd, COALESCE(SUM(price_toman), 0) as totalToman
            FROM expenses
            WHERE user_id = ?`,
      args: [user.userId],
    });

    const totalExpensesUsd = (totalExpensesResult.rows[0]?.totalUsd as number) || 0;
    const totalExpensesToman = (totalExpensesResult.rows[0]?.totalToman as number) || 0;

    // Get total assets
    const assetsResult = await db.execute({
      sql: `SELECT COALESCE(SUM(totalValueUsd), 0) as totalUsd, COALESCE(SUM(totalValueToman), 0) as totalToman
            FROM assets
            WHERE userId = ?`,
      args: [user.userId],
    });

    const totalAssetsUsd = (assetsResult.rows[0]?.totalUsd as number) || 0;
    const totalAssetsToman = (assetsResult.rows[0]?.totalToman as number) || 0;

    // Net worth = total assets (no liabilities tracked yet)
    const netWorthUsd = totalAssetsUsd;
    const netWorthToman = totalAssetsToman;

    // Get income vs expenses for last 6 months (2 queries instead of 12)
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

    // Build month/year pairs for income query
    const monthYearConditions = months.map(() => '(month = ? AND year = ?)').join(' OR ');
    const monthYearArgs = months.flatMap((m) => [m.month, m.year]);

    const incomeByMonthResult = await db.execute({
      sql: `SELECT month, year, COALESCE(SUM(amountUsd), 0) as totalUsd, COALESCE(SUM(amountToman), 0) as totalToman
            FROM incomes
            WHERE userId = ? AND (${monthYearConditions})
            GROUP BY month, year`,
      args: [user.userId, ...monthYearArgs],
    });

    // Build date range for expenses query
    const oldestStart = months[0].start;
    const newestEnd = months[months.length - 1].end;

    const expensesByMonthResult = await db.execute({
      sql: `SELECT
              CAST(SUBSTR(date, 6, 2) AS INTEGER) as month,
              CAST(SUBSTR(date, 1, 4) AS INTEGER) as year,
              COALESCE(SUM(price_usd), 0) as totalUsd,
              COALESCE(SUM(price_toman), 0) as totalToman
            FROM expenses
            WHERE user_id = ? AND date >= ? AND date <= ?
            GROUP BY SUBSTR(date, 1, 7)`,
      args: [user.userId, oldestStart, newestEnd],
    });

    // Build lookup maps
    const incomeMap = new Map<string, { usd: number; toman: number }>();
    incomeByMonthResult.rows.forEach((row) => {
      incomeMap.set(`${row.year}-${row.month}`, {
        usd: (row.totalUsd as number) || 0,
        toman: (row.totalToman as number) || 0,
      });
    });

    const expenseMap = new Map<string, { usd: number; toman: number }>();
    expensesByMonthResult.rows.forEach((row) => {
      expenseMap.set(`${row.year}-${row.month}`, {
        usd: (row.totalUsd as number) || 0,
        toman: (row.totalToman as number) || 0,
      });
    });

    const incomeVsExpenses: MonthlySummary[] = months.map((m) => {
      const inc = incomeMap.get(`${m.year}-${m.month}`) || { usd: 0, toman: 0 };
      const exp = expenseMap.get(`${m.year}-${m.month}`) || { usd: 0, toman: 0 };
      return {
        month: m.month,
        year: m.year,
        incomeUsd: inc.usd,
        incomeToman: inc.toman,
        expensesUsd: exp.usd,
        expensesToman: exp.toman,
      };
    });

    // Get assets by category (simplified - directly from assets table)
    const categoryResult = await db.execute({
      sql: `SELECT
              category,
              COALESCE(SUM(totalValueUsd), 0) as valueUsd,
              COALESCE(SUM(totalValueToman), 0) as valueToman
            FROM assets
            WHERE userId = ?
            GROUP BY category
            ORDER BY valueUsd DESC`,
      args: [user.userId],
    });

    const assetsByCategory: CategorySummary[] = categoryResult.rows.map((row) => ({
      category: row.category as AssetCategory,
      valueUsd: row.valueUsd as number,
      valueToman: row.valueToman as number,
      percentage: totalAssetsUsd > 0 ? ((row.valueUsd as number) / totalAssetsUsd) * 100 : 0,
    }));

    const response: SummaryResponse = {
      current_month_income_usd: currentMonthIncomeUsd,
      current_month_income_toman: currentMonthIncomeToman,
      current_month_expenses_usd: currentMonthExpensesUsd,
      current_month_expenses_toman: currentMonthExpensesToman,
      total_income_usd: totalIncomeUsd,
      total_income_toman: totalIncomeToman,
      total_expenses_usd: totalExpensesUsd,
      total_expenses_toman: totalExpensesToman,
      total_assets_usd: totalAssetsUsd,
      total_assets_toman: totalAssetsToman,
      net_worth_usd: netWorthUsd,
      net_worth_toman: netWorthToman,
      income_vs_expenses: incomeVsExpenses,
      assets_by_category: assetsByCategory,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Summary] Failed to fetch:', error);
    return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 });
  }
}
