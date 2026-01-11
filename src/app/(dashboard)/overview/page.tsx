'use client';

import { useEffect, useMemo, useState } from 'react';

import { BarChart3, DollarSign, Hash, Info, Lightbulb, Minus, Plus, TrendingDown, TrendingUp } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

import type { Expense } from '@types';

import DateRangeSelector, {
  type DateRange,
  filterExpensesByDateRange,
} from '@features/expenses/components/DateRangeSelector';

import { getButtonClasses } from '@components/Button';
import Tooltip from '@components/Tooltip';

import { formatNumber, getCategoryLabel } from '@utils';

// Exchange Rate Card Component
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
      <div className="relative min-w-0 rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-2.5">
            <DollarSign className="h-5 w-5 text-[#525252]" />
          </div>
        </div>
        <p className="mb-2 text-xs font-medium tracking-wider text-[#a3a3a3] uppercase">Exchange Rate</p>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#e5e5e5] border-t-[#8b5cf6]" />
          <p className="text-sm text-[#a3a3a3]">Loading...</p>
        </div>
      </div>
    );
  }

  const { value, change } = rateData.usd;
  const rate = parseInt(value, 10);
  const isZero = change === 0;
  const freshness = rateData._meta?.freshness || 'cached';
  const usage = rateData._meta?.usage;

  // Format with date + time
  const lastUpdate = rateData._meta?.fetchedAt
    ? new Date(rateData._meta.fetchedAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const freshnessStyles = {
    fresh: 'bg-[#ecfdf5] text-[#10b981] border-[#10b981]/20',
    cached: 'bg-[#fefce8] text-[#ca8a04] border-[#ca8a04]/20',
    stale: 'bg-[#fef2f2] text-[#ef4444] border-[#ef4444]/20',
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
    <div className="relative min-w-0 rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-2.5">
          <DollarSign className="h-5 w-5 text-[#525252]" />
        </div>
        <div
          className={twMerge(
            'flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold',
            (() => {
              if (isZero) return 'border-[#e5e5e5] bg-[#fafafa] text-[#a3a3a3]';
              if (change > 0) return 'border-[#e5e5e5] bg-[#ecfdf5] text-[#10b981]';
              return 'border-[#e5e5e5] bg-[#fef2f2] text-[#ef4444]';
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
        <p className="mb-2 text-xs font-medium tracking-wider text-[#a3a3a3] uppercase">Exchange Rate</p>
        <p className="text-2xl font-semibold text-[#171717] tabular-nums sm:text-3xl">
          {formatNumber(rate)} <span className="text-lg text-[#a3a3a3]">تومان</span>
        </p>
        <div className="flex items-center justify-between gap-2">
          {lastUpdate && <span className="mt-1.5 text-sm font-medium text-[#525252]">Updated {lastUpdate}</span>}
          <div className="flex items-center gap-x-2">
            <span
              className={twMerge('rounded border px-1.5 py-0.5 text-[10px] font-medium', freshnessStyles[freshness])}
            >
              {freshnessLabels[freshness]}
            </span>
            <Tooltip content={tooltipContent} position="left">
              <span className="text-[#a3a3a3] transition-colors hover:text-[#525252]">
                <Info className="h-3.5 w-3.5" />
              </span>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}

const _COLORS = [
  '#ef4444',
  '#f97316',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#22c55e',
  '#eab308',
  '#6366f1',
  '#64748b',
];

export default function DashboardPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>('ALL_TIME');

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await fetch('/api/expenses');
        if (response.ok) {
          const data = await response.json();
          setExpenses(Array.isArray(data) ? data : data.expenses || []);
        }
      } catch (error) {
        console.error('Failed to fetch expenses:', error);
      }
    };
    fetchExpenses();
  }, []);

  const filteredExpenses = useMemo(() => {
    return filterExpensesByDateRange(expenses, dateRange);
  }, [expenses, dateRange]);

  // Calculate real metrics from expenses
  const totalToman = filteredExpenses.reduce((sum, exp) => sum + exp.price_toman, 0);
  const totalUsd = filteredExpenses.reduce((sum, exp) => sum + exp.price_usd, 0);
  const transactionCount = filteredExpenses.length;

  // Calculate expenses this month vs last month for trend (using ALL expenses, not filtered)
  const thisMonthExpenses = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return expenses.filter((exp) => {
      const expDate = new Date(exp.date);
      return expDate >= startOfMonth;
    });
  }, [expenses]);

  const lastMonthExpenses = useMemo(() => {
    const now = new Date();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    endOfLastMonth.setHours(23, 59, 59, 999);
    return expenses.filter((exp) => {
      const expDate = new Date(exp.date);
      expDate.setHours(0, 0, 0, 0);
      startOfLastMonth.setHours(0, 0, 0, 0);
      return expDate >= startOfLastMonth && expDate <= endOfLastMonth;
    });
  }, [expenses]);

  const thisMonthTotal = thisMonthExpenses.reduce((sum, exp) => sum + exp.price_usd, 0);
  const lastMonthTotal = lastMonthExpenses.reduce((sum, exp) => sum + exp.price_usd, 0);
  const thisMonthTotalToman = thisMonthExpenses.reduce((sum, exp) => sum + exp.price_toman, 0);
  const lastMonthTotalToman = lastMonthExpenses.reduce((sum, exp) => sum + exp.price_toman, 0);
  const monthOverMonthChange = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

  // Calculate category breakdown for cashflow
  const categoryData = useMemo(() => {
    const categoryTotals = filteredExpenses.reduce(
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

    return categoryTotals.sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white">
      <div className="mx-auto max-w-[1600px] px-6 py-8">
        {/* Page Header */}
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-[#171717] sm:text-2xl md:text-3xl">Overview</h1>
            <p className="mt-1 text-xs text-[#a3a3a3] sm:text-sm">Welcome back! Here&apos;s your financial overview.</p>
          </div>
          <div className="flex flex-row items-center gap-2 sm:gap-3">
            <DateRangeSelector value={dateRange} onChange={setDateRange} />
            <a href="/transactions" className={getButtonClasses('primary', 'shrink-0')}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Transaction</span>
            </a>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {/* Total Expenses */}
          <div className="relative min-w-0 rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-2.5">
                <DollarSign className="h-5 w-5 text-[#525252]" />
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium tracking-wider text-[#a3a3a3] uppercase">Total Expenses</p>
              <p className="text-2xl font-semibold text-[#171717] tabular-nums sm:text-3xl" dir="rtl">
                {formatNumber(totalToman)} <span className="text-lg text-[#a3a3a3]">تومان</span>
              </p>
              <p className="mt-1.5 text-sm font-medium text-[#525252]">${totalUsd.toFixed(2)} USD</p>
            </div>
          </div>

          {/* Transaction Count */}
          <div className="relative min-w-0 rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-2.5">
                <Hash className="h-5 w-5 text-[#525252]" />
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium tracking-wider text-[#a3a3a3] uppercase">Transactions</p>
              <p className="text-2xl font-semibold text-[#171717] tabular-nums sm:text-3xl">{transactionCount}</p>
              <p className="mt-1.5 text-sm font-medium text-[#525252]" dir="rtl">
                تعداد تراکنش
              </p>
            </div>
          </div>

          {/* Average Daily Spending */}
          <div className="relative min-w-0 rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-2.5">
                <BarChart3 className="h-5 w-5 text-[#525252]" />
              </div>
              {lastMonthTotal > 0 && (
                <div
                  className={twMerge(
                    'flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold',
                    monthOverMonthChange >= 0
                      ? 'border-[#e5e5e5] bg-[#fef2f2] text-[#ef4444]'
                      : 'border-[#e5e5e5] bg-[#ecfdf5] text-[#10b981]'
                  )}
                >
                  {monthOverMonthChange >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>{Math.abs(monthOverMonthChange).toFixed(1)}%</span>
                </div>
              )}
            </div>

            <div>
              <p className="mb-2 text-xs font-medium tracking-wider text-[#a3a3a3] uppercase">Daily Average</p>
              {(() => {
                const dates = filteredExpenses.map((exp) => new Date(exp.date).getTime());
                const firstDate = dates.length > 0 ? new Date(Math.min(...dates)) : new Date();
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                firstDate.setHours(0, 0, 0, 0);
                const totalDays = Math.ceil((today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                const avgDailyToman = totalDays > 0 ? totalToman / totalDays : 0;
                const avgDailyUsd = totalDays > 0 ? totalUsd / totalDays : 0;
                return (
                  <>
                    <p className="text-2xl font-semibold text-[#171717] tabular-nums sm:text-3xl" dir="rtl">
                      {formatNumber(avgDailyToman)} <span className="text-lg text-[#a3a3a3]">تومان</span>
                    </p>
                    <p className="mt-1.5 text-sm font-medium text-[#525252]">${avgDailyUsd.toFixed(2)} USD</p>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Exchange Rate */}
          <ExchangeRateCard />
        </div>

        {/* Insights Overview */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {/* Top 3 Categories */}
          <div className="relative min-w-0 rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-2.5">
                <Lightbulb className="h-5 w-5 text-[#525252]" />
              </div>
            </div>
            <p className="mb-3 text-xs font-medium tracking-wider text-[#a3a3a3] uppercase">Top Categories</p>
            {(() => {
              const now = new Date();
              const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
              const thisMonthExpenses = filteredExpenses.filter((exp) => {
                const expDate = new Date(exp.date);
                return expDate >= startOfMonth;
              });

              // Use this month's expenses if available, otherwise use all filtered expenses
              const dataToUse = thisMonthExpenses.length > 0 ? thisMonthExpenses : filteredExpenses;

              const monthCategoryTotals = dataToUse.reduce(
                (acc, exp) => {
                  const existing = acc.find((item) => item.category === exp.category);
                  if (existing) {
                    existing.value += exp.price_toman;
                  } else {
                    const labels = getCategoryLabel(exp.category);
                    acc.push({
                      category: exp.category,
                      name: labels.en,
                      nameFa: labels.fa,
                      value: exp.price_toman,
                    });
                  }
                  return acc;
                },
                [] as Array<{ category: string; name: string; nameFa: string; value: number }>
              );

              const topThree = monthCategoryTotals.sort((a, b) => b.value - a.value).slice(0, 3);

              return topThree.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-[#a3a3a3]">
                    {thisMonthExpenses.length > 0 ? 'This Month' : 'Overall'}
                  </p>
                  {topThree.map((cat, index) => (
                    <div
                      key={cat.category}
                      className="flex items-center justify-between rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-2.5 transition-colors hover:border-[#d4d4d4]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#0070f3] text-xs font-semibold text-white">
                          {index + 1}
                        </span>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate text-sm font-medium text-[#171717]">{cat.name}</span>
                          <span className="truncate text-xs text-[#a3a3a3]" dir="rtl">
                            {cat.nameFa}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-semibold whitespace-nowrap text-[#171717] tabular-nums">
                        {formatNumber(cat.value)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#a3a3a3]">No expense data available</p>
              );
            })()}
          </div>

          {/* Highest Single Expense */}
          <div className="relative min-w-0 rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-2.5">
                <TrendingUp className="h-5 w-5 text-[#525252]" />
              </div>
            </div>
            <p className="mb-3 text-xs font-medium tracking-wider text-[#a3a3a3] uppercase">Highest Expense</p>
            {(() => {
              const highestExpense = filteredExpenses.reduce(
                (max, exp) => (exp.price_toman > max.price_toman ? exp : max),
                filteredExpenses[0]
              );

              return highestExpense ? (
                <>
                  <p className="text-2xl font-semibold text-[#171717] tabular-nums sm:text-3xl" dir="rtl">
                    {formatNumber(highestExpense.price_toman)} <span className="text-lg text-[#a3a3a3]">تومان</span>
                  </p>
                  <p className="mt-1.5 text-sm font-medium text-[#525252]">
                    ${highestExpense.price_usd.toFixed(2)} USD
                  </p>
                  <div className="mt-3 border-t border-[#e5e5e5] pt-3">
                    <p className="mb-1 text-xs text-[#a3a3a3]">
                      {new Date(highestExpense.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-sm font-medium text-[#171717]">{getCategoryLabel(highestExpense.category).en}</p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-[#a3a3a3]">No expenses yet</p>
              );
            })()}
          </div>

          {/* Month over Month Change */}
          <div className="relative min-w-0 rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div
                className={twMerge(
                  'rounded-lg border p-2.5',
                  monthOverMonthChange >= 0 ? 'border-[#e5e5e5] bg-[#fef2f2]' : 'border-[#e5e5e5] bg-[#ecfdf5]'
                )}
              >
                {monthOverMonthChange >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-[#ef4444]" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-[#10b981]" />
                )}
              </div>
            </div>
            <p className="mb-3 text-xs font-medium tracking-wider text-[#a3a3a3] uppercase">vs Last Month</p>
            {lastMonthTotal > 0 ? (
              <>
                <p
                  className={twMerge(
                    'text-2xl font-semibold tabular-nums sm:text-3xl',
                    monthOverMonthChange >= 0 ? 'text-[#ef4444]' : 'text-[#10b981]'
                  )}
                >
                  {monthOverMonthChange >= 0 ? '+' : ''}
                  {monthOverMonthChange.toFixed(1)}%
                </p>
                <p className="mt-1.5 text-sm font-medium text-[#525252]">
                  Spending{' '}
                  <span
                    className={twMerge(
                      'font-semibold',
                      monthOverMonthChange >= 0 ? 'text-[#ef4444]' : 'text-[#10b981]'
                    )}
                  >
                    {monthOverMonthChange >= 0 ? 'more' : 'less'}
                  </span>{' '}
                  than last month
                </p>
                <div className="mt-3 space-y-1 border-t border-[#e5e5e5] pt-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#a3a3a3]">This Month</span>
                    <span className="font-medium text-[#171717] tabular-nums">
                      {formatNumber(thisMonthTotalToman)} ت
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#a3a3a3]">Last Month</span>
                    <span className="text-[#525252] tabular-nums">{formatNumber(lastMonthTotalToman)} ت</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-[#a3a3a3]">Not enough data to compare</p>
            )}
          </div>
        </div>

        {/* Expenses by Category - Full Width */}
        {categoryData.length > 0 && (
          <div className="relative mb-6 overflow-hidden rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm sm:mb-8 sm:p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-2">
                <BarChart3 className="h-4 w-4 text-[#525252]" />
              </div>
              <h2 className="text-lg font-semibold text-[#171717]">Expenses by Category</h2>
            </div>

            <div className="space-y-3">
              {categoryData.map((cat, _index) => (
                <div
                  key={cat.category}
                  className="group flex min-w-0 items-center gap-3 rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-3 transition-colors hover:border-[#d4d4d4] sm:gap-4 sm:p-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-semibold text-[#171717]">{cat.name}</span>
                        <span className="truncate text-xs text-[#a3a3a3]" dir="rtl">
                          {cat.nameFa}
                        </span>
                      </div>
                      <div className="flex shrink-0 flex-col items-end">
                        <span className="text-sm font-semibold whitespace-nowrap text-[#171717] tabular-nums" dir="rtl">
                          {formatNumber(cat.value)} تومان
                        </span>
                        <span className="text-xs whitespace-nowrap text-[#a3a3a3]">${cat.usdValue.toFixed(2)} USD</span>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#e5e5e5]">
                      <div
                        className="h-full rounded-full bg-[#0070f3] transition-all duration-500"
                        style={{
                          width: `${totalToman > 0 ? (cat.value / totalToman) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Charts */}
        <div className="mb-8">
          <div className="mb-6 flex items-center gap-3">
            <h2 className="text-xl font-semibold text-[#171717]">Enhanced Analytics</h2>
            <span className="text-sm text-[#a3a3a3]" dir="rtl">
              نمودارهای پیشرفته
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2">
            {/* Comparison Chart - This Month vs Last Month */}
            <div className="relative overflow-hidden rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-2.5">
                  <BarChart3 className="h-5 w-5 text-[#525252]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#171717]">Month Comparison</h3>
                  <p className="text-xs text-[#a3a3a3]" dir="rtl">
                    مقایسه ماهانه
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {/* This Month Bar */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-[#171717]">
                      {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <span className="text-sm font-semibold text-[#171717] tabular-nums">
                      {formatNumber(thisMonthTotalToman)} ت
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-[#e5e5e5]">
                    <div
                      className="h-full rounded-full bg-[#0070f3] transition-all duration-500"
                      style={{
                        width: `${Math.max(thisMonthTotalToman, lastMonthTotalToman) > 0 ? (thisMonthTotalToman / Math.max(thisMonthTotalToman, lastMonthTotalToman)) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Last Month Bar */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-[#525252]">
                      {new Date(new Date().getFullYear(), new Date().getMonth() - 1).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="text-sm font-semibold text-[#525252] tabular-nums">
                      {formatNumber(lastMonthTotalToman)} ت
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-[#e5e5e5]">
                    <div
                      className="h-full rounded-full bg-[#d4d4d4] transition-all duration-500"
                      style={{
                        width: `${Math.max(thisMonthTotalToman, lastMonthTotalToman) > 0 ? (lastMonthTotalToman / Math.max(thisMonthTotalToman, lastMonthTotalToman)) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Difference */}
                <div className="border-t border-[#e5e5e5] pt-4">
                  {thisMonthTotalToman > 0 && lastMonthTotalToman > 0 ? (
                    <div className="flex items-center justify-between rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-3">
                      <span className="text-sm text-[#525252]">Difference</span>
                      <div className="flex items-center gap-2">
                        {thisMonthTotalToman > lastMonthTotalToman ? (
                          <TrendingUp className="h-4 w-4 text-[#ef4444]" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-[#10b981]" />
                        )}
                        <span
                          className={twMerge(
                            'text-sm font-semibold tabular-nums',
                            thisMonthTotalToman > lastMonthTotalToman ? 'text-[#ef4444]' : 'text-[#10b981]'
                          )}
                        >
                          {formatNumber(Math.abs(thisMonthTotalToman - lastMonthTotalToman))} ت
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-[#a3a3a3]">
                      {thisMonthTotalToman === 0 && lastMonthTotalToman > 0
                        ? `No spending recorded in ${new Date().toLocaleDateString('en-US', { month: 'long' })} yet`
                        : 'No data to compare'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Spending Heatmap Calendar */}
            <div className="relative overflow-hidden rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-2.5">
                  <BarChart3 className="h-5 w-5 text-[#525252]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#171717]">Spending Heatmap</h3>
                  <p className="text-xs text-[#a3a3a3]" dir="rtl">
                    نقشه حرارتی هزینه
                  </p>
                </div>
              </div>

              {(() => {
                // Determine which month to display based on dateRange
                let displayYear = new Date().getFullYear();
                let displayMonth = new Date().getMonth();

                if (dateRange === 'THIS_MONTH') {
                  // Current month
                  displayMonth = new Date().getMonth();
                  displayYear = new Date().getFullYear();
                } else if (dateRange === 'LAST_MONTH') {
                  // Last month
                  const lastMonth = new Date();
                  lastMonth.setMonth(lastMonth.getMonth() - 1);
                  displayMonth = lastMonth.getMonth();
                  displayYear = lastMonth.getFullYear();
                } else {
                  // For other ranges (7D, 30D, YTD, ALL_TIME), show current month
                  displayMonth = new Date().getMonth();
                  displayYear = new Date().getFullYear();
                }

                // Get all days in display month
                const firstDay = new Date(displayYear, displayMonth, 1);
                const lastDay = new Date(displayYear, displayMonth + 1, 0);
                const daysInMonth = lastDay.getDate();
                const startingDayOfWeek = firstDay.getDay();

                // Build calendar with spending data from filteredExpenses
                const calendarDays = [];
                for (let i = 0; i < startingDayOfWeek; i++) {
                  calendarDays.push({ date: null, total: 0, count: 0 });
                }

                for (let day = 1; day <= daysInMonth; day++) {
                  const dateStr = `${displayYear}-${String(displayMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const dayExpenses = filteredExpenses.filter((exp) => exp.date === dateStr);
                  const dayTotal = dayExpenses.reduce((sum, exp) => sum + exp.price_toman, 0);
                  calendarDays.push({
                    date: day,
                    dateStr,
                    total: dayTotal,
                    count: dayExpenses.length,
                  });
                }

                // Find max spending for color scaling
                const maxSpending = Math.max(...calendarDays.filter((d) => d.date).map((d) => d.total), 1);

                // Get color based on spending intensity
                const getHeatmapColor = (total: number) => {
                  if (total === 0) return '#f5f5f5';
                  const intensity = total / maxSpending;
                  if (intensity > 0.8) return '#0070f3';
                  if (intensity > 0.6) return '#3b9aff';
                  if (intensity > 0.4) return '#66b3ff';
                  if (intensity > 0.2) return '#99ccff';
                  return '#cce5ff';
                };

                const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

                return (
                  <div>
                    {/* Month label */}
                    <p className="mb-4 text-sm font-medium text-[#171717]">
                      {new Date(displayYear, displayMonth).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>

                    {/* Day labels */}
                    <div className="mb-3 grid grid-cols-7 gap-1.5 sm:gap-2">
                      {dayLabels.map((label) => (
                        <div key={label} className="text-center">
                          <p className="text-[10px] font-semibold tracking-wide text-[#a3a3a3] uppercase">{label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Heatmap grid */}
                    <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                      {calendarDays.map((day, idx) => (
                        <div key={idx} className="group relative">
                          {day.date ? (
                            <div
                              className="aspect-square cursor-pointer rounded-lg border border-[#e5e5e5] transition-all hover:scale-105 hover:ring-2 hover:ring-[#0070f3]"
                              style={{
                                backgroundColor: getHeatmapColor(day.total),
                              }}
                              title={`${day.date} - ${day.count} transactions - ${formatNumber(day.total)} ت`}
                            >
                              <div className="flex h-full items-center justify-center">
                                <span
                                  className={twMerge(
                                    'text-xs font-semibold sm:text-sm',
                                    day.total > 0 ? 'text-white' : 'text-[#a3a3a3]'
                                  )}
                                >
                                  {day.date}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="aspect-square rounded-lg bg-transparent" />
                          )}

                          {/* Tooltip on hover */}
                          {day.date && (
                            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 transform rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-xs whitespace-nowrap text-[#171717] opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                              <p className="font-semibold text-[#171717]">
                                {day.count} {day.count === 1 ? 'transaction' : 'transactions'}
                              </p>
                              <p className="font-medium text-[#0070f3]">{formatNumber(day.total)} ت</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Legend */}
                    <div className="mt-5 border-t border-[#e5e5e5] pt-4">
                      <p className="mb-3 text-xs font-medium text-[#a3a3a3]">Spending Intensity</p>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-[#a3a3a3]">Less</span>
                        <div className="flex gap-1.5">
                          <div
                            className="h-4 w-4 rounded-md border border-[#e5e5e5]"
                            style={{ backgroundColor: '#f5f5f5' }}
                          />
                          <div
                            className="h-4 w-4 rounded-md border border-[#e5e5e5]"
                            style={{ backgroundColor: '#cce5ff' }}
                          />
                          <div
                            className="h-4 w-4 rounded-md border border-[#e5e5e5]"
                            style={{ backgroundColor: '#99ccff' }}
                          />
                          <div
                            className="h-4 w-4 rounded-md border border-[#e5e5e5]"
                            style={{ backgroundColor: '#66b3ff' }}
                          />
                          <div
                            className="h-4 w-4 rounded-md border border-[#e5e5e5]"
                            style={{ backgroundColor: '#3b9aff' }}
                          />
                          <div
                            className="h-4 w-4 rounded-md border border-[#e5e5e5]"
                            style={{ backgroundColor: '#0070f3' }}
                          />
                        </div>
                        <span className="text-[#a3a3a3]">More</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
