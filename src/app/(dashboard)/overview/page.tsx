'use client';

import { useEffect, useMemo, useState } from 'react';

import Link from 'next/link';

import {
  ArrowRight,
  Banknote,
  DollarSign,
  Info,
  Minus,
  PieChartIcon,
  Plus,
  Tag,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { twMerge } from 'tailwind-merge';

import type { Expense } from '@types';

import DateRangeSelector, {
  type DateRange,
  filterExpensesByDateRange,
  getChartGranularity,
} from '@features/expenses/components/DateRangeSelector';

import { getButtonClasses } from '@components/Button';
import Tooltip from '@components/Tooltip';

import { formatNumber, formatToFarsiDate, getCategoryLabel } from '@utils';

// ─── Pie palette – matches ExpenseCharts exactly ───────────────────────────────
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

// ─── Skeleton ───────────────────────────────────────────────────────────────────
function Pulse({ className }: { className?: string }) {
  return <div className={twMerge('bg-background-elevated animate-pulse rounded-lg', className)} />;
}

function OverviewSkeleton() {
  return (
    <>
      {/* 4 card skeletons */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border-border-subtle bg-background rounded-xl border p-5 shadow-sm sm:p-6">
            <Pulse className="mb-4 h-10 w-10" />
            <Pulse className="mb-3 h-3 w-24" />
            <Pulse className="mb-2 h-8 w-3/4" />
            <Pulse className="h-4 w-1/3" />
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="mb-6 grid grid-cols-1 gap-5 sm:mb-8 sm:gap-6 lg:grid-cols-3">
        {/* Area chart skeleton */}
        <div className="border-border-subtle bg-background rounded-xl border p-5 shadow-sm sm:p-6 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Pulse className="h-10 w-10" />
              <Pulse className="h-5 w-36" />
            </div>
            <Pulse className="h-9 w-32" />
          </div>
          <Pulse className="h-[300px] w-full" />
        </div>

        {/* Donut skeleton */}
        <div className="border-border-subtle bg-background rounded-xl border p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <Pulse className="h-10 w-10" />
            <div>
              <Pulse className="mb-1 h-5 w-28" />
              <Pulse className="h-3 w-20" />
            </div>
          </div>
          <div className="flex h-[220px] items-center justify-center">
            <div className="relative flex h-44 w-44 items-center justify-center">
              <Pulse className="absolute h-44 w-44 rounded-full" />
              <div className="bg-background relative z-10 h-[118px] w-[118px] rounded-full" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[...Array(4)].map((_, i) => (
              <Pulse key={i} className="h-[42px]" />
            ))}
          </div>
        </div>
      </div>

      {/* Table skeleton */}
      <div className="border-border-subtle bg-background overflow-hidden rounded-xl border shadow-sm">
        <div className="flex items-center justify-between px-6 py-5">
          <Pulse className="h-5 w-44" />
          <Pulse className="h-5 w-16" />
        </div>
        <div className="bg-background-secondary px-6 py-3.5">
          <div className="flex items-center justify-between">
            <Pulse className="h-3 w-24" />
            <Pulse className="h-3 w-20" />
            <Pulse className="h-3 w-16" />
            <Pulse className="h-3 w-20" />
          </div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-border-subtle border-t px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1.5">
                <Pulse className="h-4 w-36" />
                <Pulse className="h-3 w-20" />
              </div>
              <div className="flex flex-col gap-1">
                <Pulse className="h-4 w-20" />
                <Pulse className="h-3 w-16" />
              </div>
              <div className="flex flex-col gap-1">
                <Pulse className="h-4 w-24" />
                <Pulse className="h-3 w-14" />
              </div>
              <div className="flex flex-col items-end gap-1">
                <Pulse className="h-4 w-28" />
                <Pulse className="h-3 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Exchange Rate Card ─────────────────────────────────────────────────────────
interface ExchangeRateData {
  usd?: { value: string; change: number };
  _meta?: {
    fetchedAt: string;
    freshness?: 'fresh' | 'cached' | 'stale';
    source?: 'navasan' | 'cached' | 'fallback';
    usage?: { monthly: number; remaining: number; limit: number };
  };
}

function ExchangeRateCard() {
  const [rateData, setRateData] = useState<ExchangeRateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const response = await fetch('/api/exchange-rate');
        if (response.ok) {
          const data = await response.json();
          setRateData(data);
        }
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRate();
  }, []);

  if (isLoading || !rateData?.usd) {
    return (
      <div className="border-border-subtle bg-background relative min-w-0 rounded-xl border p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
            <DollarSign className="text-text-secondary h-5 w-5" />
          </div>
        </div>
        <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">Exchange Rate</p>
        <div className="flex items-center gap-2">
          <div className="border-border-subtle border-t-info h-5 w-5 animate-spin rounded-full border-2" />
          <p className="text-text-muted text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const { value, change } = rateData.usd;
  const rate = parseInt(value, 10);
  const isZero = change === 0;
  const freshness = rateData._meta?.freshness || 'cached';
  const usage = rateData._meta?.usage;

  const lastUpdate = rateData._meta?.fetchedAt
    ? new Date(rateData._meta.fetchedAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const freshnessStyles = {
    fresh: 'bg-success-light text-success border-success/20',
    cached: 'bg-warning-light text-warning border-warning/20',
    stale: 'bg-danger-light text-danger border-danger/20',
  };

  const freshnessLabels = {
    fresh: 'Live',
    cached: 'Cached',
    stale: 'Old',
  };

  const sourceLabels = {
    navasan: 'Navasan API',
    cached: 'Database',
    fallback: 'Fallback',
  };

  const tooltipContent = (
    <div className="space-y-2 text-xs">
      <div className="flex items-center justify-between gap-4">
        <span className="text-zinc-400">Status</span>
        <span
          className={twMerge(
            'font-medium',
            freshness === 'fresh' ? 'text-green-400' : freshness === 'cached' ? 'text-yellow-400' : 'text-red-400'
          )}
        >
          {freshnessLabels[freshness]}
        </span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-zinc-400">Source</span>
        <span className="font-medium text-zinc-200">{sourceLabels[rateData._meta?.source || 'cached']}</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-zinc-400">Updated</span>
        <span className="font-medium text-zinc-200">{lastUpdate}</span>
      </div>
      {usage && (
        <>
          <div className="my-1.5 border-t border-zinc-700" />
          <div className="flex items-center justify-between gap-4">
            <span className="text-zinc-400">API Remaining</span>
            <span className={twMerge('font-medium', usage.remaining < 10 ? 'text-red-400' : 'text-zinc-200')}>
              {usage.remaining}/{usage.limit}
            </span>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="border-border-subtle bg-background relative min-w-0 rounded-xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
          <DollarSign className="text-text-secondary h-5 w-5" />
        </div>
        <div
          className={twMerge(
            'flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold',
            (() => {
              if (isZero) return 'border-border-subtle bg-background-secondary text-text-muted';
              if (change > 0) return 'border-border-subtle bg-success-light text-success';
              return 'border-border-subtle bg-danger-light text-danger';
            })()
          )}
        >
          {isZero ? (
            <>
              <Minus className="h-3 w-3" />
              <span>Stable</span>
            </>
          ) : (
            <>
              {change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>
                {change > 0 ? '+' : ''}
                {formatNumber(Math.abs(change))}
              </span>
            </>
          )}
        </div>
      </div>

      <div>
        <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">Exchange Rate</p>
        <p className="text-text-primary text-2xl font-semibold tabular-nums sm:text-3xl">
          {formatNumber(rate)} <span className="text-text-muted text-lg">تومان</span>
        </p>
        <div className="flex items-center justify-between gap-2">
          {lastUpdate && <span className="text-text-secondary mt-1.5 text-sm font-medium">Updated {lastUpdate}</span>}
          <div className="flex items-center gap-x-2">
            <span
              className={twMerge('rounded border px-1.5 py-0.5 text-[10px] font-medium', freshnessStyles[freshness])}
            >
              {freshnessLabels[freshness]}
            </span>
            <Tooltip content={tooltipContent} position="left">
              <span className="text-text-muted hover:text-text-secondary transition-colors">
                <Info className="h-3.5 w-3.5" />
              </span>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Summary API shape ──────────────────────────────────────────────────────────
interface SummaryData {
  current_month_income_usd: number;
  current_month_income_toman: number;
  current_month_expenses_usd: number;
  current_month_expenses_toman: number;
  total_income_usd: number;
  total_income_toman: number;
  total_expenses_usd: number;
  total_expenses_toman: number;
  net_worth_usd: number;
  net_worth_toman: number;
}

// ─── Custom recharts tooltips ───────────────────────────────────────────────────
function SpendingTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: { usdValue?: number } }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const usdValue = payload[0]?.payload?.usdValue || 0;
  return (
    <div className="border-border-subtle bg-background rounded-lg border p-4 shadow-lg">
      <p className="text-text-primary text-lg font-bold" dir="rtl">
        {formatNumber(payload[0].value)} تومان
      </p>
      <p className="text-text-muted mt-1.5 text-sm font-medium">${usdValue.toFixed(2)} USD</p>
      {label && <p className="text-blue mt-2 text-sm font-medium">{label}</p>}
    </div>
  );
}

function CategoryTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: { nameFa?: string; usdValue?: number } }>;
}) {
  if (!active || !payload?.length) return null;
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

// ─── Aggregation helpers (same logic as ExpenseCharts) ─────────────────────────
function getWeekKey(date: Date): string {
  const year = date.getFullYear();
  const firstDayOfYear = new Date(year, 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  return `${year}-W${weekNum.toString().padStart(2, '0')}`;
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
}

// ─── Main page ──────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('30D');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, expensesRes] = await Promise.all([fetch('/api/summary'), fetch('/api/expenses')]);
        if (summaryRes.ok) setSummary(await summaryRes.json());
        if (expensesRes.ok) {
          const data = await expensesRes.json();
          setExpenses(Array.isArray(data) ? data : data.expenses || []);
        }
      } catch (error) {
        console.error('Failed to fetch overview data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Derived data ──────────────────────────────────────────────────────────────
  /** Last 5 expenses, newest first */
  const recentTransactions = useMemo(() => {
    return [...expenses]
      .sort((a, b) => {
        if (a.date !== b.date) return new Date(b.date).getTime() - new Date(a.date).getTime();
        return b.id - a.id;
      })
      .slice(0, 5);
  }, [expenses]);

  /** Expenses filtered by the selected date range (for spending trend chart) */
  const filteredExpenses = useMemo(() => filterExpensesByDateRange(expenses, dateRange), [expenses, dateRange]);
  const granularity = useMemo(() => getChartGranularity(dateRange), [dateRange]);

  /** Aggregated spending trend for area chart */
  const spendingTrend = useMemo(() => {
    if (filteredExpenses.length === 0) return [];

    const aggregated = new Map<string, { amount: number; usdValue: number }>();

    filteredExpenses.forEach((exp) => {
      const date = new Date(`${exp.date}T00:00:00`);
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
  }, [filteredExpenses, granularity]);

  /** This month's expenses grouped by category (for donut chart) */
  const categorySplit = useMemo(() => {
    const now = new Date();
    const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const monthExps = expenses.filter((exp) => exp.date >= startOfMonth);

    const totals = monthExps.reduce(
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
    return totals.sort((a, b) => b.value - a.value);
  }, [expenses]);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="mx-auto max-w-[1600px] px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-text-primary text-xl font-bold sm:text-2xl md:text-3xl">Overview</h1>
            <p className="text-text-muted mt-1 text-xs sm:text-sm">
              Welcome back! Here&apos;s your financial overview.
            </p>
          </div>
          <Link href="/transactions" className={getButtonClasses('primary', 'shrink-0')}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Transaction</span>
          </Link>
        </div>

        {isLoading ? (
          <OverviewSkeleton />
        ) : (
          <>
            {/* ── 4 Summary Cards ───────────────────────────────────────────────── */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
              {/* Net Worth */}
              <div className="border-border-subtle bg-background relative min-w-0 rounded-xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
                    <Banknote className="text-success h-5 w-5" />
                  </div>
                </div>
                <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">Net Worth</p>
                <p className="text-text-primary text-2xl font-semibold tabular-nums sm:text-3xl" dir="rtl">
                  {formatNumber(summary?.net_worth_toman ?? 0)} <span className="text-text-muted text-lg">تومان</span>
                </p>
                <p className="text-text-secondary mt-1.5 text-sm font-medium">
                  ${(summary?.net_worth_usd ?? 0).toFixed(2)} USD
                </p>
              </div>

              {/* Total Income – all time */}
              <div className="border-border-subtle bg-background relative min-w-0 rounded-xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
                    <TrendingUp className="text-success h-5 w-5" />
                  </div>
                </div>
                <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">Total Income</p>
                <p className="text-text-primary text-2xl font-semibold tabular-nums sm:text-3xl" dir="rtl">
                  {formatNumber(summary?.total_income_toman ?? 0)}{' '}
                  <span className="text-text-muted text-lg">تومان</span>
                </p>
                <p className="text-text-secondary mt-1.5 text-sm font-medium">
                  ${(summary?.total_income_usd ?? 0).toFixed(2)} USD
                </p>
              </div>

              {/* Total Expenses – all time */}
              <div className="border-border-subtle bg-background relative min-w-0 rounded-xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
                    <TrendingDown className="text-danger h-5 w-5" />
                  </div>
                </div>
                <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">Total Expenses</p>
                <p className="text-text-primary text-2xl font-semibold tabular-nums sm:text-3xl" dir="rtl">
                  {formatNumber(summary?.total_expenses_toman ?? 0)}{' '}
                  <span className="text-text-muted text-lg">تومان</span>
                </p>
                <p className="text-text-secondary mt-1.5 text-sm font-medium">
                  ${(summary?.total_expenses_usd ?? 0).toFixed(2)} USD
                </p>
              </div>

              {/* Exchange Rate (self-fetching card) */}
              <ExchangeRateCard />
            </div>

            {/* ── Charts row: Spending Trend (2 cols) + Category Split (1 col) ─── */}
            <div className="mb-6 grid grid-cols-1 gap-5 sm:mb-8 sm:gap-6 lg:grid-cols-3">
              {/* Spending Trend – area chart with DateRangeSelector */}
              <div className="border-border-subtle bg-background relative rounded-xl border p-5 shadow-sm sm:p-6 lg:col-span-2">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
                      <TrendingUp className="text-blue h-5 w-5" />
                    </div>
                    <h2 className="text-text-primary text-lg font-semibold">Spending Trend</h2>
                  </div>
                  <DateRangeSelector value={dateRange} onChange={setDateRange} />
                </div>

                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <AreaChart data={spendingTrend} margin={{ left: 0, right: 20, top: 10, bottom: 0 }}>
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
                          if (granularity === 'monthly') return value.slice(5);
                          if (granularity === 'weekly') return value.split('-W')[1];
                          return value.slice(5);
                        }}
                      />
                      <YAxis
                        stroke="#e5e5e5"
                        tick={{ fill: '#a3a3a3', fontSize: 12, fontWeight: 500 }}
                        axisLine={{ stroke: '#e5e5e5' }}
                        tickLine={{ stroke: '#e5e5e5' }}
                        tickFormatter={(v: number) =>
                          v >= 1_000_000
                            ? `${(v / 1_000_000).toFixed(0)}M`
                            : v >= 1_000
                              ? `${(v / 1_000).toFixed(0)}K`
                              : `${v}`
                        }
                      />
                      <RechartsTooltip
                        content={<SpendingTooltip />}
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

              {/* Category Split – donut chart matching ExpenseCharts */}
              <div className="border-border-subtle bg-background relative rounded-xl border p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
                    <PieChartIcon className="text-blue h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-text-primary text-lg font-semibold">Category Split</h3>
                    <p className="text-text-muted text-sm" dir="rtl">
                      بر اساس دسته‌بندی
                    </p>
                  </div>
                </div>

                {categorySplit.length > 0 ? (
                  <>
                    <div className="h-[220px]">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <PieChart>
                          <Pie
                            data={categorySplit}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={95}
                            paddingAngle={4}
                            dataKey="value"
                            stroke="#ffffff"
                            strokeWidth={2}
                            animationDuration={800}
                            animationEasing="ease-out"
                          >
                            {categorySplit.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip content={<CategoryTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Legend – pill style matching ExpenseCharts */}
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {categorySplit.map((cat, index) => (
                        <div
                          key={cat.category}
                          className="border-border-subtle bg-background-secondary hover:bg-background-elevated flex cursor-default items-center gap-2.5 rounded-lg border p-2.5 transition-all duration-200"
                        >
                          <div
                            className="h-3 w-3 shrink-0 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-text-secondary truncate text-sm font-medium">{cat.name}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex h-[220px] flex-col items-center justify-center">
                    <p className="text-text-muted text-sm">No expenses this month</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Recent Transactions ─────────────────────────────────────────── */}
            <div className="border-border-subtle bg-background overflow-hidden rounded-xl border shadow-sm">
              <div className="flex items-center justify-between px-6 py-5">
                <h2 className="text-text-primary text-lg font-semibold">Recent Transactions</h2>
                <Link
                  href="/transactions"
                  className="text-blue flex items-center gap-1 text-sm font-medium hover:underline"
                >
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {recentTransactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                      <tr className="bg-background-secondary">
                        <th className="text-text-muted px-6 py-4 text-left text-xs font-semibold tracking-wider uppercase">
                          Description
                        </th>
                        <th className="text-text-muted px-6 py-4 text-left text-xs font-semibold tracking-wider uppercase">
                          Category
                        </th>
                        <th className="text-text-muted px-6 py-4 text-left text-xs font-semibold tracking-wider uppercase">
                          Date
                        </th>
                        <th className="text-text-muted px-6 py-4 text-right text-xs font-semibold tracking-wider uppercase">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.map((expense) => {
                        const categoryLabels = getCategoryLabel(expense.category);
                        const farsiDate = formatToFarsiDate(expense.date);

                        return (
                          <tr
                            key={expense.id}
                            className="border-border-subtle hover:bg-background-elevated border-t transition-colors duration-200 first:border-t-0"
                          >
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-2">
                                <span className="text-text-primary text-sm font-medium">{expense.description}</span>
                                {expense.tags && expense.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5">
                                    {expense.tags.map((tag) => (
                                      <div
                                        key={tag.id}
                                        className="border-border-subtle bg-background-elevated text-text-secondary flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium"
                                      >
                                        <Tag className="h-3 w-3" />
                                        <span>{tag.name}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-text-primary text-sm font-medium">{categoryLabels.en}</span>
                                <span className="text-text-muted text-xs" dir="rtl">
                                  {categoryLabels.fa}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-text-primary text-sm">{expense.date}</span>
                                <span className="text-text-muted text-xs" dir="rtl">
                                  {farsiDate}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex flex-col items-end">
                                <span className="text-text-primary text-sm font-semibold" dir="rtl">
                                  {formatNumber(expense.price_toman)} تومان
                                </span>
                                <span className="text-text-muted text-xs">${expense.price_usd.toFixed(2)} USD</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-text-muted px-6 py-8 text-center text-sm">No transactions yet</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
