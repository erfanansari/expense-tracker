'use client';

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

import { formatChartTooltipDate, formatNumber, getCategoryLabel } from '@utils';

import { type Expense } from '@/@types/expense';

interface ExpenseChartsProps {
  expenses: Expense[];
  granularity?: 'daily' | 'weekly' | 'monthly';
}

// Neutral colors for light mode
const COLORS = [
  '#0070f3', // Vercel blue
  '#525252', // dark gray
  '#737373', // medium gray
  '#10b981', // emerald (success)
  '#3b82f6', // blue
  '#a3a3a3', // light gray
  '#2563eb', // darker blue
  '#171717', // black
];

// Tooltip for pie / bar (category-based)
const CategoryTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ value: number; payload: { name?: string; usdValue?: number } }>;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const usdValue = data.payload.usdValue || 0;
    return (
      <div className="border-border-subtle bg-background rounded-lg border p-4 shadow-lg">
        <p className="text-text-primary text-lg font-bold">{formatNumber(data.value)} Toman</p>
        <p className="text-text-muted mt-1.5 text-sm font-medium">${usdValue.toFixed(2)} USD</p>
        {data.payload.name && <p className="text-blue mt-2 text-sm font-medium">{data.payload.name}</p>}
      </div>
    );
  }
  return null;
};

// Tooltip for the time-series area chart (date-based)
const AreaTooltip = ({
  active,
  payload,
  label,
  granularity,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ value: number; payload: { usdValue?: number } }>;
  label?: string | number;
  granularity: 'daily' | 'weekly' | 'monthly';
}) => {
  if (!active || !payload?.length) return null;
  const usdValue = payload[0].payload.usdValue || 0;
  return (
    <div className="border-border-subtle bg-background rounded-lg border p-4 shadow-lg">
      <p className="text-text-primary text-lg font-bold">{formatNumber(payload[0].value)} Toman</p>
      <p className="text-text-muted mt-1.5 text-sm font-medium">${usdValue.toFixed(2)} USD</p>
      {label != null && (
        <p className="text-blue mt-2 text-sm font-medium">{formatChartTooltipDate(String(label), granularity)}</p>
      )}
    </div>
  );
};

export function ExpenseCharts({ expenses, granularity = 'daily' }: ExpenseChartsProps) {
  // Variables
  const categoryTotals = expenses.reduce(
    (acc, exp) => {
      const existing = acc.find((item) => item.category === exp.category);
      if (existing) {
        existing.value += exp.price_toman;
        existing.usdValue += exp.price_usd;
      } else {
        const labels = getCategoryLabel(exp.category);
        acc.push({
          category: exp.category,
          name: labels.en,
          value: exp.price_toman,
          usdValue: exp.price_usd,
        });
      }
      return acc;
    },
    [] as Array<{ category: string; name: string; value: number; usdValue: number }>
  );

  categoryTotals.sort((a, b) => b.value - a.value);

  // Helper functions for date formatting
  const getWeekKey = (date: Date): string => format(startOfWeek(date), 'yyyy-MM-dd');

  const getMonthKey = (date: Date): string => {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  // Aggregate expenses based on granularity
  const aggregateExpenses = () => {
    if (expenses.length === 0) return [];

    const aggregated = new Map<string, { amount: number; usdValue: number }>();

    expenses.forEach((exp) => {
      const date = new Date(exp.date);
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
        existing.amount += exp.price_toman;
        existing.usdValue += exp.price_usd;
      } else {
        aggregated.set(key, { amount: exp.price_toman, usdValue: exp.price_usd });
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
                stroke="#ffffff"
                strokeWidth={2}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {categoryTotals.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CategoryTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2">
          {categoryTotals.map((cat, index) => (
            <div
              key={cat.category}
              className="border-border-subtle bg-background-secondary hover:bg-background-elevated flex cursor-default items-center gap-2.5 rounded-lg border p-2.5 transition-all duration-200"
            >
              <div
                className="h-3 w-3 shrink-0 rounded-full"
                style={{
                  backgroundColor: COLORS[index % COLORS.length],
                }}
              />
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
                tickFormatter={(value: number) => `${Math.round(value / 1_000_000)}M`}
                stroke="#e5e5e5"
                tick={{ fill: '#a3a3a3', fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: '#e5e5e5' }}
                tickLine={{ stroke: '#e5e5e5' }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                stroke="#e5e5e5"
                tick={{ fill: '#525252', fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: '#e5e5e5' }}
                tickLine={{ stroke: '#e5e5e5' }}
              />
              <Tooltip content={<CategoryTooltip />} cursor={{ fill: '#fafafa' }} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} animationDuration={800}>
                {categoryTotals.map((_, index) => (
                  <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
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
                  <stop offset="0%" stopColor="#0070f3" stopOpacity={0.2} />
                  <stop offset="50%" stopColor="#0070f3" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#0070f3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" opacity={0.5} vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#e5e5e5"
                tick={{ fill: '#a3a3a3', fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: '#e5e5e5' }}
                tickLine={{ stroke: '#e5e5e5' }}
                minTickGap={40}
                interval="preserveStartEnd"
                tickFormatter={(value: string) => {
                  if (granularity === 'monthly') return format(parseISO(`${value}-01`), 'MMM yyyy');
                  return format(parseISO(value), 'MMM d');
                }}
              />
              <YAxis
                stroke="#e5e5e5"
                tick={{ fill: '#a3a3a3', fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: '#e5e5e5' }}
                tickLine={{ stroke: '#e5e5e5' }}
                tickFormatter={(value: number) => `${Math.round(value / 1_000_000)}M`}
              />
              <Tooltip
                content={(props) => <AreaTooltip {...props} granularity={granularity} />}
                cursor={{ stroke: '#0070f3', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#0070f3"
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
