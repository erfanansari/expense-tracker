'use client';

import { getCategoryColor } from '@constants/categories';
import { format, parseISO, startOfWeek } from 'date-fns';
import { BarChart3, PieChartIcon, TrendingUp } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useCurrency } from '@features/ExchangeRate/CurrencyProvider';
import type { MoneyItem } from '@features/ExchangeRate/CurrencyProvider';

import ChartTooltip from '@components/ChartTooltip';

import { formatAxisNumber, formatChartTooltipDate } from '@utils';

import { type Expense } from '@/@types/expense';
import { PIVOT_CURRENCY } from '@/constants/currencies';

interface ExpenseChartsProps {
  expenses: Expense[];
  granularity?: 'daily' | 'weekly' | 'monthly';
}

// Tooltip for pie / bar (category-based). Categories span all dates, so the
// primary/secondary strings are pre-summed per-record in the component.
const CategoryTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload: { name?: string; primaryStr?: string; secondaryStr?: string } }>;
}) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <ChartTooltip
      primary={d.primaryStr ?? ''}
      secondary={d.secondaryStr}
      accent={d.name ? { text: d.name, tone: 'blue' } : undefined}
    />
  );
};

// Tooltip for the time-series area chart (date-based)
const AreaTooltip = ({
  active,
  payload,
  label,
  granularity,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ value?: number | string | ReadonlyArray<number | string> }>;
  label?: string | number;
  granularity: 'daily' | 'weekly' | 'monthly';
}) => {
  const { display } = useCurrency();
  if (!active || !payload?.length) return null;
  const rawValue = payload[0].value;
  const numericValue = typeof rawValue === 'number' ? rawValue : Number(rawValue) || 0;
  // Convert at the bucket's own date (monthly keys are YYYY-MM → use mid-month).
  const bucket = label != null ? String(label) : undefined;
  const convDate = bucket && bucket.length === 7 ? `${bucket}-15` : bucket;
  const { primary, secondary } = display(numericValue, PIVOT_CURRENCY, convDate, { compact: true });
  return (
    <ChartTooltip
      primary={primary}
      secondary={secondary ?? undefined}
      accent={label != null ? { text: formatChartTooltipDate(String(label), granularity), tone: 'blue' } : undefined}
    />
  );
};

export function ExpenseCharts({ expenses, granularity = 'daily' }: ExpenseChartsProps) {
  const { sumTo, format: fmtMoney, primaryCurrency, secondaryCurrency } = useCurrency();
  const showSecondary = !!secondaryCurrency && secondaryCurrency !== primaryCurrency;

  // Aggregate per category. `value` (pivot) drives segment sizing; primary/
  // secondary strings are summed per-record at each expense's date (accurate).
  const catMap = new Map<number, { name: string; color: string; value: number; items: MoneyItem[] }>();
  expenses.forEach((exp) => {
    const pivot = exp.amount * exp.entryRate;
    const item: MoneyItem = { amount: exp.amount, currency: exp.currency, date: exp.date };
    const ex = catMap.get(exp.category.id);
    if (ex) {
      ex.value += pivot;
      ex.items.push(item);
    } else {
      catMap.set(exp.category.id, {
        name: exp.category.name,
        color: getCategoryColor(exp.category.color).fill,
        value: pivot,
        items: [item],
      });
    }
  });

  const categoryTotals = Array.from(catMap.entries())
    .map(([categoryId, c]) => ({
      categoryId,
      name: c.name,
      color: c.color,
      value: c.value,
      primaryStr: fmtMoney(sumTo(c.items, primaryCurrency), primaryCurrency, { compact: true }),
      secondaryStr: showSecondary
        ? fmtMoney(sumTo(c.items, secondaryCurrency || primaryCurrency), secondaryCurrency || primaryCurrency, {
            compact: true,
          })
        : undefined,
    }))
    .sort((a, b) => b.value - a.value);

  // Helper functions for date formatting
  const getWeekKey = (date: Date): string => format(startOfWeek(date), 'yyyy-MM-dd');

  const getMonthKey = (date: Date): string => {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  // Aggregate expenses based on granularity
  const aggregateExpenses = () => {
    if (expenses.length === 0) return [];

    const aggregated = new Map<string, { amount: number }>();

    expenses.forEach((exp) => {
      const date = new Date(exp.date);
      const pivot = exp.amount * exp.entryRate;
      let key: string;

      switch (granularity) {
        case 'weekly':
          key = getWeekKey(date);
          break;
        case 'monthly':
          key = getMonthKey(date);
          break;
        case 'daily':
        default:
          key = exp.date;
          break;
      }

      const existing = aggregated.get(key);
      if (existing) {
        existing.amount += pivot;
      } else {
        aggregated.set(key, { amount: pivot });
      }
    });

    return Array.from(aggregated.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const timeSeriesTotals = aggregateExpenses();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Pie Chart */}
      <div className="border-border-subtle bg-background relative rounded-xl border p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
            <PieChartIcon className="text-blue h-5 w-5" />
          </div>
          <h3 className="text-text-primary text-lg font-semibold">By Category</h3>
        </div>

        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <PieChart>
              <Pie
                data={categoryTotals}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
                dataKey="value"
                stroke="var(--color-background)"
                strokeWidth={2}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {categoryTotals.map((cat) => (
                  <Cell key={`cell-${cat.categoryId}`} fill={cat.color} />
                ))}
              </Pie>
              <Tooltip content={<CategoryTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2">
          {categoryTotals.map((cat) => (
            <div
              key={cat.categoryId}
              className="border-border-subtle bg-background-secondary hover:bg-background-elevated flex cursor-default items-center gap-2.5 rounded-lg border p-2.5 transition-all duration-200"
            >
              <div className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: cat.color }} />
              <span className="text-text-secondary truncate text-sm font-medium">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="border-border-subtle bg-background relative flex h-full flex-col rounded-xl border p-6 shadow-sm">
        <div className="mb-6 flex shrink-0 items-center gap-3">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
            <BarChart3 className="text-success h-5 w-5" />
          </div>
          <h3 className="text-text-primary text-lg font-semibold">Category Comparison</h3>
        </div>

        <div className="min-h-[320px] flex-1">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={categoryTotals} layout="vertical" margin={{ left: 0, right: 20 }}>
              <XAxis
                type="number"
                tickFormatter={formatAxisNumber}
                stroke="var(--color-border-subtle)"
                tick={{ fill: 'var(--color-text-muted)', fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: 'var(--color-border-subtle)' }}
                tickLine={{ stroke: 'var(--color-border-subtle)' }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                stroke="var(--color-border-subtle)"
                tick={{ fill: 'var(--color-text-secondary)', fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: 'var(--color-border-subtle)' }}
                tickLine={{ stroke: 'var(--color-border-subtle)' }}
              />
              <Tooltip content={<CategoryTooltip />} cursor={{ fill: 'var(--color-background-secondary)' }} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} animationDuration={800}>
                {categoryTotals.map((cat) => (
                  <Cell key={`bar-${cat.categoryId}`} fill={cat.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Area Chart - Spending Trend */}
      <div className="border-border-subtle bg-background relative rounded-xl border p-6 shadow-sm lg:col-span-2">
        <div className="mb-6 flex items-center gap-3">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
            <TrendingUp className="text-blue h-5 w-5" />
          </div>
          <h3 className="text-text-primary text-lg font-semibold">
            {granularity === 'daily' && 'Daily Spending Trend'}
            {granularity === 'weekly' && 'Weekly Spending Trend'}
            {granularity === 'monthly' && 'Monthly Spending Trend'}
          </h3>
        </div>

        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart data={timeSeriesTotals} margin={{ left: 0, right: 20, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-blue)" stopOpacity={0.2} />
                  <stop offset="50%" stopColor="var(--color-blue)" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="var(--color-blue)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" opacity={0.5} vertical={false} />
              <XAxis
                dataKey="date"
                stroke="var(--color-border-subtle)"
                tick={{ fill: 'var(--color-text-muted)', fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: 'var(--color-border-subtle)' }}
                tickLine={{ stroke: 'var(--color-border-subtle)' }}
                minTickGap={40}
                interval="preserveStartEnd"
                tickFormatter={(value: string) => {
                  if (granularity === 'monthly') return format(parseISO(`${value}-01`), 'MMM yyyy');
                  return format(parseISO(value), 'MMM d');
                }}
              />
              <YAxis
                stroke="var(--color-border-subtle)"
                tick={{ fill: 'var(--color-text-muted)', fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: 'var(--color-border-subtle)' }}
                tickLine={{ stroke: 'var(--color-border-subtle)' }}
                tickFormatter={formatAxisNumber}
              />
              <Tooltip
                content={(props) => <AreaTooltip {...props} granularity={granularity} />}
                cursor={{ stroke: 'var(--color-blue)', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="var(--color-blue)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorAmount)"
                animationDuration={1000}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
