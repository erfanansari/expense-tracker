import { db } from '@core/database/client';

import { getMonthLabel } from '@/constants/income';

export type ReportType = 'monthly' | 'yearly';

export interface ReportPeriod {
  type: ReportType;
  year: number;
  month?: number; // 1..12, required when type='monthly'
}

export interface CurrencyPair {
  usd: number;
  toman: number;
}

export interface PeriodTotals {
  income: CurrencyPair;
  expenses: CurrencyPair;
  net: CurrencyPair;
}

export interface TopCategory {
  id: number;
  name: string;
  icon: string;
  color: string;
  value: CurrencyPair;
  pct: number; // share of total expenses for the period, 0..100
}

export interface MonthlyBreakdown {
  month: number;
  year: number;
  income: CurrencyPair;
  expenses: CurrencyPair;
}

export interface ReportData {
  type: ReportType;
  periodLabel: string; // 'May 2026' or '2025'
  periodKey: string; // '2026-05' or '2025' — used in sentEmailReports idempotency
  totals: PeriodTotals;
  previous: PeriodTotals;
  deltaPct: { income: number; expenses: number };
  topCategories: TopCategory[];
  netWorth: CurrencyPair;
  // Yearly-only enrichment
  months?: MonthlyBreakdown[];
  bestMonth?: MonthlyBreakdown & { net: CurrencyPair };
  worstMonth?: MonthlyBreakdown & { net: CurrencyPair };
  totalSaved?: CurrencyPair;
  savingsRatePct?: number;
}

interface DateBounds {
  start: string; // 'YYYY-MM-DD'
  end: string;
}

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

function lastDayOfMonth(year: number, month: number): number {
  // month is 1-based; Date(year, month, 0) gives the last day of `month`.
  return new Date(year, month, 0).getDate();
}

function monthBounds(year: number, month: number): DateBounds {
  return {
    start: `${year}-${pad2(month)}-01`,
    end: `${year}-${pad2(month)}-${pad2(lastDayOfMonth(year, month))}`,
  };
}

function yearBounds(year: number): DateBounds {
  return { start: `${year}-01-01`, end: `${year}-12-31` };
}

function previousMonth(year: number, month: number): { year: number; month: number } {
  if (month === 1) return { year: year - 1, month: 12 };
  return { year, month: month - 1 };
}

function deltaPct(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}

async function incomeTotalsForMonth(userId: number, year: number, month: number): Promise<CurrencyPair> {
  const result = await db.execute({
    sql: `SELECT COALESCE(SUM(amountUsd), 0) AS usd, COALESCE(SUM(amountToman), 0) AS toman
          FROM incomes WHERE userId = ? AND month = ? AND year = ?`,
    args: [userId, month, year],
  });
  const row = result.rows[0];
  return { usd: (row?.usd as number) || 0, toman: (row?.toman as number) || 0 };
}

async function incomeTotalsForYear(userId: number, year: number): Promise<CurrencyPair> {
  const result = await db.execute({
    sql: `SELECT COALESCE(SUM(amountUsd), 0) AS usd, COALESCE(SUM(amountToman), 0) AS toman
          FROM incomes WHERE userId = ? AND year = ?`,
    args: [userId, year],
  });
  const row = result.rows[0];
  return { usd: (row?.usd as number) || 0, toman: (row?.toman as number) || 0 };
}

async function expenseTotalsForRange(userId: number, bounds: DateBounds): Promise<CurrencyPair> {
  const result = await db.execute({
    sql: `SELECT COALESCE(SUM(price_usd), 0) AS usd, COALESCE(SUM(price_toman), 0) AS toman
          FROM expenses WHERE user_id = ? AND date >= ? AND date <= ?`,
    args: [userId, bounds.start, bounds.end],
  });
  const row = result.rows[0];
  return { usd: (row?.usd as number) || 0, toman: (row?.toman as number) || 0 };
}

async function topCategoriesForRange(userId: number, bounds: DateBounds, limit = 5): Promise<TopCategory[]> {
  const result = await db.execute({
    sql: `SELECT c.id, c.name, c.icon, c.color,
                 COALESCE(SUM(e.price_usd), 0)   AS valueUsd,
                 COALESCE(SUM(e.price_toman), 0) AS valueToman
          FROM expenses e
          JOIN categories c ON c.id = e.category_id
          WHERE e.user_id = ? AND e.date >= ? AND e.date <= ?
          GROUP BY c.id
          ORDER BY valueUsd DESC
          LIMIT ?`,
    args: [userId, bounds.start, bounds.end, limit],
  });

  const totalUsd = result.rows.reduce((acc, r) => acc + ((r.valueUsd as number) || 0), 0);

  return result.rows.map((row) => {
    const valueUsd = (row.valueUsd as number) || 0;
    return {
      id: row.id as number,
      name: row.name as string,
      icon: row.icon as string,
      color: row.color as string,
      value: { usd: valueUsd, toman: (row.valueToman as number) || 0 },
      pct: totalUsd > 0 ? (valueUsd / totalUsd) * 100 : 0,
    };
  });
}

async function netWorthSnapshot(userId: number): Promise<CurrencyPair> {
  const result = await db.execute({
    sql: `SELECT COALESCE(SUM(totalValueUsd), 0) AS usd, COALESCE(SUM(totalValueToman), 0) AS toman
          FROM assets WHERE userId = ?`,
    args: [userId],
  });
  const row = result.rows[0];
  return { usd: (row?.usd as number) || 0, toman: (row?.toman as number) || 0 };
}

async function monthlyBreakdownForYear(userId: number, year: number): Promise<MonthlyBreakdown[]> {
  const bounds = yearBounds(year);

  const [incomeRows, expenseRows] = await Promise.all([
    db.execute({
      sql: `SELECT month, COALESCE(SUM(amountUsd), 0) AS usd, COALESCE(SUM(amountToman), 0) AS toman
            FROM incomes WHERE userId = ? AND year = ? GROUP BY month`,
      args: [userId, year],
    }),
    db.execute({
      sql: `SELECT CAST(SUBSTR(date, 6, 2) AS INTEGER) AS month,
                   COALESCE(SUM(price_usd), 0)   AS usd,
                   COALESCE(SUM(price_toman), 0) AS toman
            FROM expenses
            WHERE user_id = ? AND date >= ? AND date <= ?
            GROUP BY SUBSTR(date, 6, 2)`,
      args: [userId, bounds.start, bounds.end],
    }),
  ]);

  const incomeMap = new Map<number, CurrencyPair>();
  incomeRows.rows.forEach((r) => {
    incomeMap.set(r.month as number, {
      usd: (r.usd as number) || 0,
      toman: (r.toman as number) || 0,
    });
  });

  const expenseMap = new Map<number, CurrencyPair>();
  expenseRows.rows.forEach((r) => {
    expenseMap.set(r.month as number, {
      usd: (r.usd as number) || 0,
      toman: (r.toman as number) || 0,
    });
  });

  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return {
      month,
      year,
      income: incomeMap.get(month) ?? { usd: 0, toman: 0 },
      expenses: expenseMap.get(month) ?? { usd: 0, toman: 0 },
    };
  });
}

function buildTotals(income: CurrencyPair, expenses: CurrencyPair): PeriodTotals {
  return {
    income,
    expenses,
    net: { usd: income.usd - expenses.usd, toman: income.toman - expenses.toman },
  };
}

function buildPeriodKey(period: ReportPeriod): string {
  if (period.type === 'monthly') return `${period.year}-${pad2(period.month as number)}`;
  return String(period.year);
}

function buildPeriodLabel(period: ReportPeriod): string {
  if (period.type === 'monthly') {
    const name = getMonthLabel(period.month as number).en;
    return `${name} ${period.year}`;
  }
  return String(period.year);
}

export async function getReportData(userId: number, period: ReportPeriod): Promise<ReportData> {
  if (period.type === 'monthly' && !period.month) {
    throw new Error('Monthly reports require a `month` (1..12).');
  }

  const periodLabel = buildPeriodLabel(period);
  const periodKey = buildPeriodKey(period);

  if (period.type === 'monthly') {
    const month = period.month as number;
    const bounds = monthBounds(period.year, month);
    const prev = previousMonth(period.year, month);
    const prevBounds = monthBounds(prev.year, prev.month);

    const [income, expenses, prevIncome, prevExpenses, topCategories, netWorth] = await Promise.all([
      incomeTotalsForMonth(userId, period.year, month),
      expenseTotalsForRange(userId, bounds),
      incomeTotalsForMonth(userId, prev.year, prev.month),
      expenseTotalsForRange(userId, prevBounds),
      topCategoriesForRange(userId, bounds),
      netWorthSnapshot(userId),
    ]);

    const totals = buildTotals(income, expenses);
    const previous = buildTotals(prevIncome, prevExpenses);

    return {
      type: 'monthly',
      periodLabel,
      periodKey,
      totals,
      previous,
      deltaPct: {
        income: deltaPct(income.usd, prevIncome.usd),
        expenses: deltaPct(expenses.usd, prevExpenses.usd),
      },
      topCategories,
      netWorth,
    };
  }

  // Yearly
  const bounds = yearBounds(period.year);
  const prevBounds = yearBounds(period.year - 1);

  const [income, expenses, prevIncome, prevExpenses, topCategories, netWorth, months] = await Promise.all([
    incomeTotalsForYear(userId, period.year),
    expenseTotalsForRange(userId, bounds),
    incomeTotalsForYear(userId, period.year - 1),
    expenseTotalsForRange(userId, prevBounds),
    topCategoriesForRange(userId, bounds),
    netWorthSnapshot(userId),
    monthlyBreakdownForYear(userId, period.year),
  ]);

  const totals = buildTotals(income, expenses);
  const previous = buildTotals(prevIncome, prevExpenses);

  const monthsWithNet = months.map((m) => ({
    ...m,
    net: { usd: m.income.usd - m.expenses.usd, toman: m.income.toman - m.expenses.toman },
  }));

  // Skip zero-activity months when choosing best/worst — sending "best month: $0"
  // is meaningless. If no month has activity, both stay undefined.
  const activeMonths = monthsWithNet.filter((m) => m.income.usd !== 0 || m.expenses.usd !== 0);
  const bestMonth = activeMonths.length ? activeMonths.reduce((a, b) => (b.net.usd > a.net.usd ? b : a)) : undefined;
  const worstMonth = activeMonths.length ? activeMonths.reduce((a, b) => (b.net.usd < a.net.usd ? b : a)) : undefined;

  const totalSaved: CurrencyPair = { usd: income.usd - expenses.usd, toman: income.toman - expenses.toman };
  const savingsRatePct = income.usd > 0 ? (totalSaved.usd / income.usd) * 100 : 0;

  return {
    type: 'yearly',
    periodLabel,
    periodKey,
    totals,
    previous,
    deltaPct: {
      income: deltaPct(income.usd, prevIncome.usd),
      expenses: deltaPct(expenses.usd, prevExpenses.usd),
    },
    topCategories,
    netWorth,
    months,
    bestMonth,
    worstMonth,
    totalSaved,
    savingsRatePct,
  };
}

/**
 * For Day-1-of-month cron runs, compute the just-completed reporting period.
 * Given today=Jun 1, 2026 returns {year:2026, month:5}. For Jan 1 → Dec of prev year.
 */
export function previousMonthOf(date: Date): { year: number; month: number } {
  const m = date.getUTCMonth() + 1; // 1..12
  const y = date.getUTCFullYear();
  return previousMonth(y, m);
}
