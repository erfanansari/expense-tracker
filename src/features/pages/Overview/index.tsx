'use client';

import { useMemo, useState } from 'react';

import Link from 'next/link';

import { type ColumnDef } from '@tanstack/react-table';
import { ArrowRight, Banknote, DollarSign, Info, Minus, Plus, Tag, TrendingDown, TrendingUp } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
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
import DataTable from '@components/DataTable';
import Tooltip from '@components/Tooltip';

import { formatNumber } from '@utils';

import { useAllExpenses } from '@/hooks/use-all-expenses';
import { useExchangeRate } from '@/hooks/use-exchange-rate';
import { useSummary } from '@/hooks/use-summary';

// ─── Skeleton ───────────────────────────────────────────────────────────────────
function Pulse({ className }: { className?: string }) {
  return <div className={twMerge('h-6 w-full animate-pulse rounded-sm bg-zinc-300', className)} aria-label="Loading" />;
}

function OverviewSkeleton() {
  return (
    <>
      {/* 4 card skeletons */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border-border-subtle bg-background rounded-xl border p-4 shadow-sm sm:p-6">
            <Pulse className="mb-3 h-9 w-9 sm:mb-4 sm:h-10 sm:w-10" />
            <Pulse className="mb-2 h-3 w-20 sm:mb-3 sm:w-24" />
            <Pulse className="mb-2 h-6 w-3/4 sm:h-8" />
            <Pulse className="h-3 w-1/3 sm:h-4" />
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:gap-6 lg:grid-cols-3">
        {/* Area chart skeleton */}
        <div className="border-border-subtle bg-background rounded-xl border p-4 shadow-sm sm:p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between sm:mb-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <Pulse className="h-9 w-9 sm:h-10 sm:w-10" />
              <Pulse className="h-4 w-28 sm:h-5 sm:w-36" />
            </div>
            <Pulse className="h-8 w-24 sm:h-9 sm:w-32" />
          </div>
          <Pulse className="h-[220px] w-full sm:h-[300px]" />
        </div>

        {/* Donut skeleton */}
        <div className="border-border-subtle bg-background rounded-xl border p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-2 sm:mb-5 sm:gap-3">
            <Pulse className="h-9 w-9 sm:h-10 sm:w-10" />
            <div>
              <Pulse className="mb-1 h-4 w-24 sm:h-5 sm:w-28" />
              <Pulse className="h-3 w-16 sm:w-20" />
            </div>
          </div>
          <div className="flex h-[180px] items-center justify-center sm:h-[220px]">
            <div className="relative flex h-36 w-36 items-center justify-center sm:h-44 sm:w-44">
              <Pulse className="absolute h-36 w-36 rounded-full sm:h-44 sm:w-44" />
              <div className="bg-background relative z-10 h-[94px] w-[94px] rounded-full sm:h-[118px] sm:w-[118px]" />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4">
            {[...Array(4)].map((_, i) => (
              <Pulse key={i} className="h-9 sm:h-[42px]" />
            ))}
          </div>
        </div>
      </div>

      {/* Table skeleton */}
      <div className="border-border-subtle bg-background overflow-hidden rounded-xl border shadow-sm">
        <div className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
          <Pulse className="h-5 w-36 sm:w-44" />
          <Pulse className="h-5 w-14 sm:w-16" />
        </div>
        <div className="bg-background-secondary px-4 py-3 sm:px-6 sm:py-3.5">
          <div className="flex items-center justify-between">
            <Pulse className="h-3 w-20 sm:w-24" />
            <Pulse className="hidden h-3 w-20 sm:block" />
            <Pulse className="hidden h-3 w-16 sm:block" />
            <Pulse className="h-3 w-16 sm:w-20" />
          </div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-border-subtle border-t px-4 py-3.5 sm:px-6 sm:py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Pulse className="h-4 w-32 sm:w-36" />
                <Pulse className="h-3 w-20" />
              </div>
              <div className="hidden flex-col gap-1 sm:flex">
                <Pulse className="h-4 w-20" />
                <Pulse className="h-3 w-16" />
              </div>
              <div className="hidden flex-col gap-1 sm:flex">
                <Pulse className="h-4 w-24" />
                <Pulse className="h-3 w-14" />
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Pulse className="h-4 w-20 sm:w-28" />
                <Pulse className="h-3 w-14 sm:w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Exchange Rate Card ─────────────────────────────────────────────────────────
function ExchangeRateCard() {
  const { data: rateData, isLoading } = useExchangeRate();

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
          {formatNumber(rate)} <span className="text-text-muted text-lg">Toman</span>
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
      <p className="text-text-primary text-lg font-bold">{formatNumber(payload[0].value)} Toman</p>
      <p className="text-text-muted mt-1.5 text-sm font-medium">${usdValue.toFixed(2)} USD</p>
      {label && <p className="text-blue mt-2 text-sm font-medium">{label}</p>}
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

// ─── Overview table columns ───────────────────────────────────────────────────
const overviewColumns: ColumnDef<Expense, unknown>[] = [
  {
    id: 'description',
    accessorKey: 'description',
    header: 'Description',
    meta: { widthClass: 'w-[60%]' },
    cell: ({ row }) => {
      const expense = row.original;
      return (
        <div className="flex flex-col gap-2">
          <span className="text-text-primary text-sm font-medium">{expense.description}</span>
          {expense.tags && expense.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {expense.tags.map((tag) => (
                <div
                  key={tag.id}
                  className="border-border-subtle bg-background-elevated text-text-secondary flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium"
                >
                  <Tag className="h-3 w-3" aria-hidden="true" />
                  <span>{tag.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: 'amount',
    accessorKey: 'price_toman',
    header: 'Amount',
    meta: { widthClass: 'w-[40%]', align: 'right' },
    cell: ({ row }) => {
      const expense = row.original;
      return (
        <div className="flex flex-col items-end">
          <span className="text-text-primary text-sm font-semibold">{formatNumber(expense.price_toman)} Toman</span>
          <span className="text-text-muted text-xs">${expense.price_usd.toFixed(2)} USD</span>
        </div>
      );
    },
  },
];

// ─── Main page ──────────────────────────────────────────────────────────────────
function Dashboard() {
  const { data: summary, isLoading: summaryLoading } = useSummary();
  const { data: expensesData, isLoading: expensesLoading } = useAllExpenses();
  const [dateRange, setDateRange] = useState<DateRange>('30D');

  const expenses: Expense[] = expensesData ?? [];
  const isLoading = summaryLoading || expensesLoading;

  // ── Derived data ──────────────────────────────────────────────────────────────
  /** Last 5 expenses, newest first */
  const recentTransactions = useMemo(() => {
    return [...expenses]
      .sort((a, b) => {
        if (a.date !== b.date) return new Date(b.date).getTime() - new Date(a.date).getTime();
        return b.id - a.id;
      })
      .slice(0, 7);
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

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="mx-auto max-w-[1600px] p-8 px-6">
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
                <p className="text-text-primary text-2xl font-semibold tabular-nums sm:text-3xl">
                  {formatNumber(summary?.net_worth_toman ?? 0)} <span className="text-text-muted text-lg">Toman</span>
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
                <p className="text-text-primary text-2xl font-semibold tabular-nums sm:text-3xl">
                  {formatNumber(summary?.total_income_toman ?? 0)}{' '}
                  <span className="text-text-muted text-lg">Toman</span>
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
                <p className="text-text-primary text-2xl font-semibold tabular-nums sm:text-3xl">
                  {formatNumber(summary?.total_expenses_toman ?? 0)}{' '}
                  <span className="text-text-muted text-lg">Toman</span>
                </p>
                <p className="text-text-secondary mt-1.5 text-sm font-medium">
                  ${(summary?.total_expenses_usd ?? 0).toFixed(2)} USD
                </p>
              </div>

              {/* Exchange Rate (self-fetching card) */}
              <ExchangeRateCard />
            </div>

            {/* ── Charts row: Spending Trend (2 cols) + Category Split (1 col) ─── */}
            <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3">
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

                <div className="h-[450px]">
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

              {/* ── Recent Transactions ─────────────────────────────────────────── */}
              <DataTable
                data={recentTransactions}
                columns={overviewColumns}
                minimal={true}
                minWidth="min-w-[480px]"
                header={
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
                }
                emptyState={<p className="text-text-muted text-sm">No transactions yet</p>}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
