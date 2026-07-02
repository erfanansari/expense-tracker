import { db } from '@core/database/client';

import { getMonthLabel } from '@/constants/income';

export type ReportType = 'monthly' | 'yearly';

export interface ReportPeriod {
  type: ReportType;
  year: number;
  month?: number; // 1..12, required when type='monthly'
}

/** A monetary value in the pivot currency (IRT). */
export interface MoneyValue {
  value: number;
}

export interface PeriodTotals {
  income: MoneyValue;
  expenses: MoneyValue;
  net: MoneyValue;
}

export interface TopCategory {
  id: number;
  name: string;
  icon: string;
  color: string;
  value: MoneyValue;
  pct: number; // share of total expenses for the period, 0..100
}

export interface MonthlyBreakdown {
  month: number;
  year: number;
  income: MoneyValue;
  expenses: MoneyValue;
}

export interface ReportData {
  type: ReportType;
  periodLabel: string; // 'May 2026' or '2025'
  periodKey: string; // '2026-05' or '2025' — used in sentEmailReports idempotency
  totals: PeriodTotals;
  previous: PeriodTotals;
  deltaPct: { income: number; expenses: number };
  topCategories: TopCategory[];
  // Yearly-only enrichment
  months?: MonthlyBreakdown[];
  bestMonth?: MonthlyBreakdown & { net: MoneyValue };
  worstMonth?: MonthlyBreakdown & { net: MoneyValue };
  totalSaved?: MoneyValue;
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

const val = (v: unknown): number => (typeof v === 'number' ? v : 0);

async function incomeTotalsForMonth(userId: number, year: number, month: number): Promise<MoneyValue> {
  const result = await db.execute({
    sql: `SELECT COALESCE(SUM(amount * entryRate), 0) AS value
          FROM incomes WHERE userId = ? AND month = ? AND year = ?`,
    args: [userId, month, year],
  });
  return { value: val(result.rows[0]?.value) };
}

async function incomeTotalsForYear(userId: number, year: number): Promise<MoneyValue> {
  const result = await db.execute({
    sql: `SELECT COALESCE(SUM(amount * entryRate), 0) AS value FROM incomes WHERE userId = ? AND year = ?`,
    args: [userId, year],
  });
  return { value: val(result.rows[0]?.value) };
}

async function expenseTotalsForRange(userId: number, bounds: DateBounds): Promise<MoneyValue> {
  const result = await db.execute({
    sql: `SELECT COALESCE(SUM(amount * entryRate), 0) AS value
          FROM expenses WHERE user_id = ? AND date >= ? AND date <= ?`,
    args: [userId, bounds.start, bounds.end],
  });
  return { value: val(result.rows[0]?.value) };
}

async function topCategoriesForRange(userId: number, bounds: DateBounds, limit = 5): Promise<TopCategory[]> {
  const result = await db.execute({
    sql: `SELECT c.id, c.name, c.icon, c.color,
                 COALESCE(SUM(e.amount * e.entryRate), 0) AS value
          FROM expenses e
          JOIN categories c ON c.id = e.category_id
          WHERE e.user_id = ? AND e.date >= ? AND e.date <= ?
          GROUP BY c.id
          ORDER BY value DESC
          LIMIT ?`,
    args: [userId, bounds.start, bounds.end, limit],
  });

  const total = result.rows.reduce((acc, r) => acc + val(r.value), 0);

  return result.rows.map((row) => {
    const value = val(row.value);
    return {
      id: row.id as number,
      name: row.name as string,
      icon: row.icon as string,
      color: row.color as string,
      value: { value },
      pct: total > 0 ? (value / total) * 100 : 0,
    };
  });
}

async function monthlyBreakdownForYear(userId: number, year: number): Promise<MonthlyBreakdown[]> {
  const bounds = yearBounds(year);

  const [incomeRows, expenseRows] = await Promise.all([
    db.execute({
      sql: `SELECT month, COALESCE(SUM(amount * entryRate), 0) AS value
            FROM incomes WHERE userId = ? AND year = ? GROUP BY month`,
      args: [userId, year],
    }),
    db.execute({
      sql: `SELECT CAST(SUBSTR(date, 6, 2) AS INTEGER) AS month,
                   COALESCE(SUM(amount * entryRate), 0) AS value
            FROM expenses
            WHERE user_id = ? AND date >= ? AND date <= ?
            GROUP BY SUBSTR(date, 6, 2)`,
      args: [userId, bounds.start, bounds.end],
    }),
  ]);

  const incomeMap = new Map<number, MoneyValue>();
  incomeRows.rows.forEach((r) => incomeMap.set(r.month as number, { value: val(r.value) }));

  const expenseMap = new Map<number, MoneyValue>();
  expenseRows.rows.forEach((r) => expenseMap.set(r.month as number, { value: val(r.value) }));

  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return {
      month,
      year,
      income: incomeMap.get(month) ?? { value: 0 },
      expenses: expenseMap.get(month) ?? { value: 0 },
    };
  });
}

function buildTotals(income: MoneyValue, expenses: MoneyValue): PeriodTotals {
  return {
    income,
    expenses,
    net: { value: income.value - expenses.value },
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

    const [income, expenses, prevIncome, prevExpenses, topCategories] = await Promise.all([
      incomeTotalsForMonth(userId, period.year, month),
      expenseTotalsForRange(userId, bounds),
      incomeTotalsForMonth(userId, prev.year, prev.month),
      expenseTotalsForRange(userId, prevBounds),
      topCategoriesForRange(userId, bounds),
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
        income: deltaPct(income.value, prevIncome.value),
        expenses: deltaPct(expenses.value, prevExpenses.value),
      },
      topCategories,
    };
  }

  // Yearly
  const bounds = yearBounds(period.year);
  const prevBounds = yearBounds(period.year - 1);

  const [income, expenses, prevIncome, prevExpenses, topCategories, months] = await Promise.all([
    incomeTotalsForYear(userId, period.year),
    expenseTotalsForRange(userId, bounds),
    incomeTotalsForYear(userId, period.year - 1),
    expenseTotalsForRange(userId, prevBounds),
    topCategoriesForRange(userId, bounds),
    monthlyBreakdownForYear(userId, period.year),
  ]);

  const totals = buildTotals(income, expenses);
  const previous = buildTotals(prevIncome, prevExpenses);

  const monthsWithNet = months.map((m) => ({
    ...m,
    net: { value: m.income.value - m.expenses.value },
  }));

  // Skip zero-activity months when choosing best/worst.
  const activeMonths = monthsWithNet.filter((m) => m.income.value !== 0 || m.expenses.value !== 0);
  const bestMonth = activeMonths.length
    ? activeMonths.reduce((a, b) => (b.net.value > a.net.value ? b : a))
    : undefined;
  const worstMonth = activeMonths.length
    ? activeMonths.reduce((a, b) => (b.net.value < a.net.value ? b : a))
    : undefined;

  const totalSaved: MoneyValue = { value: income.value - expenses.value };
  const savingsRatePct = income.value > 0 ? (totalSaved.value / income.value) * 100 : 0;

  return {
    type: 'yearly',
    periodLabel,
    periodKey,
    totals,
    previous,
    deltaPct: {
      income: deltaPct(income.value, prevIncome.value),
      expenses: deltaPct(expenses.value, prevExpenses.value),
    },
    topCategories,
    months,
    bestMonth,
    worstMonth,
    totalSaved,
    savingsRatePct,
  };
}

/**
 * For Day-1-of-month cron runs, compute the just-completed reporting period.
 */
export function previousMonthOf(date: Date): { year: number; month: number } {
  const m = date.getUTCMonth() + 1; // 1..12
  const y = date.getUTCFullYear();
  return previousMonth(y, m);
}
