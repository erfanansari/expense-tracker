'use client';

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

import { type Expense } from '@/@types/expense';
import { formatNumber, getCategoryLabel } from '@/utils';

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

// Custom tooltip component
const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: { nameFa?: string; usdValue?: number } }>;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const usdValue = data.payload.usdValue || 0;
    return (
      <div className="border-border-subtle bg-background rounded-lg border p-4 shadow-lg">
        <p className="text-text-primary text-lg font-bold" dir="rtl">
          {formatNumber(data.value)} تومان
        </p>
        <p className="text-text-muted mt-1.5 text-sm font-medium">${usdValue.toFixed(2)} USD</p>
        {data.payload.nameFa && (
          <p className="text-blue mt-2 text-sm font-medium" dir="rtl">
            {data.payload.nameFa}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function ExpenseCharts({ expenses, granularity = 'daily' }: ExpenseChartsProps) {
  // Calculate category totals
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
          nameFa: labels.fa,
          value: exp.price_toman,
          usdValue: exp.price_usd,
        });
      }
      return acc;
    },
    [] as Array<{ category: string; name: string; nameFa: string; value: number; usdValue: number }>
  );

  categoryTotals.sort((a, b) => b.value - a.value);

  // Helper functions for date formatting
  const getWeekKey = (date: Date): string => {
    const year = date.getFullYear();
    const firstDayOfYear = new Date(year, 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    return `${year}-W${weekNum.toString().padStart(2, '0')}`;
  };

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
          <div>
            <h3 className="text-text-primary text-lg font-bold">By Category</h3>
            <p className="text-text-muted text-sm" dir="rtl">
              بر اساس دسته‌بندی
            </p>
          </div>
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
              <Tooltip content={<CustomTooltip />} />
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
      <div className="border-border-subtle bg-background relative rounded-xl border p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
            <BarChart3 className="text-success h-5 w-5" />
          </div>
          <div>
            <h3 className="text-text-primary text-lg font-bold">Category Comparison</h3>
            <p className="text-text-muted text-sm" dir="rtl">
              مقایسه دسته‌بندی
            </p>
          </div>
        </div>

        <div className="h-[400px]">
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
                dataKey="nameFa"
                width={80}
                stroke="#e5e5e5"
                tick={{ fill: '#525252', fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: '#e5e5e5' }}
                tickLine={{ stroke: '#e5e5e5' }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#fafafa' }} />
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
          <div>
            <h3 className="text-text-primary text-lg font-bold">
              {granularity === 'daily' && 'Daily Spending Trend'}
              {granularity === 'weekly' && 'Weekly Spending Trend'}
              {granularity === 'monthly' && 'Monthly Spending Trend'}
            </h3>
            <p className="text-text-muted text-sm" dir="rtl">
              {granularity === 'daily' && 'روند هزینه روزانه'}
              {granularity === 'weekly' && 'روند هزینه هفتگی'}
              {granularity === 'monthly' && 'روند هزینه ماهانه'}
            </p>
          </div>
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
                tickFormatter={(value: string) => {
                  if (granularity === 'monthly') {
                    return value.slice(5);
                  } else if (granularity === 'weekly') {
                    return value.split('-W')[1];
                  }
                  return value.slice(5);
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
                content={<CustomTooltip />}
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
