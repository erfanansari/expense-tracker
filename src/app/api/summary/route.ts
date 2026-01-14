import { NextResponse } from 'next/server';

import type { AssetCategory } from '@/@types/asset';
import { db } from '@/core/database/client';
import { getCurrentUser } from '@/core/session/session';

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

    // Get income vs expenses for last 6 months
    const incomeVsExpenses: MonthlySummary[] = [];

    for (let i = 0; i < 6; i++) {
      const date = new Date(currentYear, currentMonth - 1 - i, 1);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
      const monthEnd = new Date(year, month, 0);
      const monthEndStr = `${year}-${String(month).padStart(2, '0')}-${String(monthEnd.getDate()).padStart(2, '0')}`;

      // Get income for this month
      const incomeResult = await db.execute({
        sql: `SELECT COALESCE(SUM(amountUsd), 0) as totalUsd, COALESCE(SUM(amountToman), 0) as totalToman
              FROM incomes
              WHERE userId = ? AND month = ? AND year = ?`,
        args: [user.userId, month, year],
      });

      // Get expenses for this month
      const expensesResult = await db.execute({
        sql: `SELECT COALESCE(SUM(price_usd), 0) as totalUsd, COALESCE(SUM(price_toman), 0) as totalToman
              FROM expenses
              WHERE user_id = ? AND date >= ? AND date <= ?`,
        args: [user.userId, monthStart, monthEndStr],
      });

      incomeVsExpenses.push({
        month,
        year,
        incomeUsd: (incomeResult.rows[0]?.totalUsd as number) || 0,
        incomeToman: (incomeResult.rows[0]?.totalToman as number) || 0,
        expensesUsd: (expensesResult.rows[0]?.totalUsd as number) || 0,
        expensesToman: (expensesResult.rows[0]?.totalToman as number) || 0,
      });
    }

    // Reverse to show oldest first
    incomeVsExpenses.reverse();

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
