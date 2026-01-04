'use client';

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';
import { PieChartIcon, BarChart3, TrendingUp, Sparkles } from 'lucide-react';
import { type Expense } from '@/lib/types/expense';
import { formatNumber, getCategoryLabel } from '@/lib/utils';

interface ExpenseChartsProps {
  expenses: Expense[];
  granularity?: 'daily' | 'weekly' | 'monthly';
}

// Premium gradient colors
const COLORS = [
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#f59e0b', // amber
  '#ec4899', // pink
  '#10b981', // emerald
  '#f43f5e', // rose
  '#84cc16', // lime
  '#6366f1', // indigo
];

// Custom tooltip component with glassmorphism effect
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: { nameFa?: string; usdValue?: number } }> }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const usdValue = data.payload.usdValue || 0;
    return (
      <div className="bg-[#0f0f18]/95 backdrop-blur-xl border border-[#2a2a40] p-4 rounded-2xl shadow-2xl shadow-black/40">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent rounded-t-2xl" />
        <p className="text-white font-bold text-lg" dir="rtl">
          {formatNumber(data.value)} تومان
        </p>
        <p className="text-zinc-400 text-sm mt-1.5 font-medium">
          ${usdValue.toFixed(2)} USD
        </p>
        {data.payload.nameFa && (
          <p className="text-violet-400 text-sm mt-2 font-medium" dir="rtl">
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
  const categoryTotals = expenses.reduce((acc, exp) => {
    const existing = acc.find(item => item.category === exp.category);
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
  }, [] as Array<{ category: string; name: string; nameFa: string; value: number; usdValue: number }>);

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

    expenses.forEach(exp => {
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pie Chart */}
      <div className="relative bg-gradient-to-br from-[#0f0f18] to-[#0a0a12] rounded-2xl border border-[#1f1f30] p-6 overflow-hidden group hover:border-violet-500/30 transition-all duration-300">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-gradient-to-br from-violet-500/20 to-purple-600/20 rounded-xl border border-violet-500/30 shadow-lg shadow-violet-500/10">
            <PieChartIcon className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              By Category
            </h3>
            <p className="text-sm text-zinc-500" dir="rtl">بر اساس دسته‌بندی</p>
          </div>
        </div>

        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <PieChart>
              <defs>
                {COLORS.map((color, index) => (
                  <linearGradient key={`gradient-${index}`} id={`pieGradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={1} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={categoryTotals}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
                dataKey="value"
                stroke="transparent"
                animationDuration={800}
                animationEasing="ease-out"
              >
                {categoryTotals.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#pieGradient-${index % COLORS.length})`}
                    className="drop-shadow-lg"
                  />
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
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#0a0a12]/50 hover:bg-[#1a1a28] border border-transparent hover:border-[#2a2a40] transition-all duration-200 cursor-default"
            >
              <div
                className="w-3 h-3 rounded-full shrink-0 shadow-lg"
                style={{
                  backgroundColor: COLORS[index % COLORS.length],
                  boxShadow: `0 0 8px ${COLORS[index % COLORS.length]}40`
                }}
              />
              <span className="text-sm text-zinc-400 truncate font-medium">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="relative bg-gradient-to-br from-[#0f0f18] to-[#0a0a12] rounded-2xl border border-[#1f1f30] p-6 overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-green-600/20 rounded-xl border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
            <BarChart3 className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Category Comparison
            </h3>
            <p className="text-sm text-zinc-500" dir="rtl">مقایسه دسته‌بندی</p>
          </div>
        </div>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={categoryTotals} layout="vertical" margin={{ left: 0, right: 20 }}>
              <defs>
                {COLORS.map((color, index) => (
                  <linearGradient key={`barGradient-${index}`} id={`barGradient-${index}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={color} stopOpacity={1} />
                  </linearGradient>
                ))}
              </defs>
              <XAxis
                type="number"
                tickFormatter={(value: number) => `${Math.round(value / 1_000_000)}M`}
                stroke="#3f3f5a"
                tick={{ fill: '#71717a', fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: '#1f1f30' }}
                tickLine={{ stroke: '#1f1f30' }}
              />
              <YAxis
                type="category"
                dataKey="nameFa"
                width={80}
                stroke="#3f3f5a"
                tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: '#1f1f30' }}
                tickLine={{ stroke: '#1f1f30' }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1f1f30' }} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} animationDuration={800}>
                {categoryTotals.map((_, index) => (
                  <Cell
                    key={`bar-${index}`}
                    fill={`url(#barGradient-${index % COLORS.length})`}
                    className="drop-shadow-md"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Area Chart - Spending Trend */}
      <div className="relative bg-gradient-to-br from-[#0f0f18] to-[#0a0a12] rounded-2xl border border-[#1f1f30] p-6 overflow-hidden lg:col-span-2 group hover:border-cyan-500/30 transition-all duration-300">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-violet-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
            <TrendingUp className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {granularity === 'daily' && 'Daily Spending Trend'}
              {granularity === 'weekly' && 'Weekly Spending Trend'}
              {granularity === 'monthly' && 'Monthly Spending Trend'}
            </h3>
            <p className="text-sm text-zinc-500" dir="rtl">
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
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} />
                  <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="50%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f30" opacity={0.8} vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#3f3f5a"
                tick={{ fill: '#71717a', fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: '#1f1f30' }}
                tickLine={{ stroke: '#1f1f30' }}
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
                stroke="#3f3f5a"
                tick={{ fill: '#71717a', fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: '#1f1f30' }}
                tickLine={{ stroke: '#1f1f30' }}
                tickFormatter={(value: number) => `${Math.round(value / 1_000_000)}M`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#8b5cf6', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="url(#strokeGradient)"
                strokeWidth={3}
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
