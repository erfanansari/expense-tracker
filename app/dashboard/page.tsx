'use client';

import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { DateRangeSelector, type DateRange, filterExpensesByDateRange } from '@/components/date-range-selector';
import { type Expense } from '@/lib/types/expense';
import { TrendingUp, TrendingDown, DollarSign, Hash, BarChart3, Plus, MoreVertical, Minus, Lightbulb } from 'lucide-react';
import { formatNumber, getCategoryLabel } from '@/lib/utils';

// Exchange Rate Card Component
function ExchangeRateCard() {
  const [rateData, setRateData] = useState<{ usd?: { value: string; change: number }; _meta?: { fetchedAt: string } } | null>(null);
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
      <div className="relative bg-white rounded-xl p-5 sm:p-6 border border-[#e5e5e5] min-w-0 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 bg-[#fafafa] rounded-lg border border-[#e5e5e5]">
            <DollarSign className="h-5 w-5 text-[#525252]" />
          </div>
        </div>
        <p className="text-xs text-[#a3a3a3] font-medium uppercase tracking-wider mb-2">Exchange Rate</p>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-[#e5e5e5] border-t-[#8b5cf6] animate-spin" />
          <p className="text-sm text-[#a3a3a3]">Loading...</p>
        </div>
      </div>
    );
  }

  const { value, change } = rateData.usd;
  const rate = parseInt(value, 10);
  const isZero = change === 0;

  const lastUpdate = rateData._meta?.fetchedAt
    ? (() => {
        const date = new Date(rateData._meta.fetchedAt);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes.toString().padStart(2, '0');
        return `${displayHours}:${displayMinutes} ${ampm}`;
      })()
    : '';

  return (
    <div className="relative bg-white rounded-xl p-5 sm:p-6 border border-[#e5e5e5] min-w-0 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 bg-[#fafafa] rounded-lg border border-[#e5e5e5]">
          <DollarSign className="h-5 w-5 text-[#525252]" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md border ${
          isZero
            ? 'bg-[#fafafa] text-[#a3a3a3] border-[#e5e5e5]'
            : change > 0
            ? 'bg-[#ecfdf5] text-[#10b981] border-[#e5e5e5]'
            : 'bg-[#fef2f2] text-[#ef4444] border-[#e5e5e5]'
        }`}>
          {isZero ? (
            <>
              <Minus className="h-3 w-3" />
              <span>Stable</span>
            </>
          ) : (
            <>
              {change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{change > 0 ? '+' : ''}{formatNumber(Math.abs(change))}</span>
            </>
          )}
        </div>
      </div>

      <div>
        <p className="text-xs text-[#a3a3a3] font-medium uppercase tracking-wider mb-2">Exchange Rate</p>
        <p className="text-2xl sm:text-3xl font-semibold text-[#171717] tabular-nums">
          {formatNumber(rate)} <span className="text-lg text-[#a3a3a3]">تومان</span>
        </p>
        {lastUpdate && (
          <p className="text-sm text-[#525252] mt-1.5 font-medium">
            Updated at {lastUpdate}
          </p>
        )}
      </div>
    </div>
  );
}

const COLORS = ['#ef4444', '#f97316', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#22c55e', '#eab308', '#6366f1', '#64748b'];

export default function DashboardPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>('ALL_TIME');

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await fetch('/api/expenses');
        if (response.ok) {
          const data = await response.json();
          setExpenses(Array.isArray(data) ? data : (data.expenses || []));
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
    return expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate >= startOfMonth;
    });
  }, [expenses]);

  const lastMonthExpenses = useMemo(() => {
    const now = new Date();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    endOfLastMonth.setHours(23, 59, 59, 999);
    return expenses.filter(exp => {
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
  const monthOverMonthChange = lastMonthTotal > 0
    ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
    : 0;

  // Calculate category breakdown for cashflow
  const categoryData = useMemo(() => {
    const categoryTotals = filteredExpenses.reduce((acc, exp) => {
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

    return categoryTotals.sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white overflow-x-hidden relative">
        <div className="max-w-[1600px] mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#171717]">Dashboard</h1>
              <p className="text-xs sm:text-sm text-[#a3a3a3] mt-1">Welcome back! Here's your financial overview.</p>
            </div>
            <div className="flex flex-row items-center gap-2 sm:gap-3">
              <DateRangeSelector value={dateRange} onChange={setDateRange} />
              <a
                href="/transactions"
                className="px-3 sm:px-5 py-2.5 bg-[#000000] hover:bg-[#171717] text-white rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm flex-shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Transaction</span>
              </a>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8">
            {/* Total Expenses */}
            <div className="relative bg-white rounded-xl p-5 sm:p-6 border border-[#e5e5e5] min-w-0 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-[#fafafa] rounded-lg border border-[#e5e5e5]">
                  <DollarSign className="h-5 w-5 text-[#525252]" />
                </div>
              </div>

              <div>
                <p className="text-xs text-[#a3a3a3] font-medium uppercase tracking-wider mb-2">Total Expenses</p>
                <p className="text-2xl sm:text-3xl font-semibold text-[#171717] tabular-nums" dir="rtl">
                  {formatNumber(totalToman)} <span className="text-lg text-[#a3a3a3]">تومان</span>
                </p>
                <p className="text-sm text-[#525252] mt-1.5 font-medium">
                  ${totalUsd.toFixed(2)} USD
                </p>
              </div>
            </div>

            {/* Transaction Count */}
            <div className="relative bg-white rounded-xl p-5 sm:p-6 border border-[#e5e5e5] min-w-0 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-[#fafafa] rounded-lg border border-[#e5e5e5]">
                  <Hash className="h-5 w-5 text-[#525252]" />
                </div>
              </div>

              <div>
                <p className="text-xs text-[#a3a3a3] font-medium uppercase tracking-wider mb-2">Transactions</p>
                <p className="text-2xl sm:text-3xl font-semibold text-[#171717] tabular-nums">{transactionCount}</p>
                <p className="text-sm text-[#525252] mt-1.5 font-medium" dir="rtl">تعداد تراکنش</p>
              </div>
            </div>

            {/* Average Daily Spending */}
            <div className="relative bg-white rounded-xl p-5 sm:p-6 border border-[#e5e5e5] min-w-0 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-[#fafafa] rounded-lg border border-[#e5e5e5]">
                  <BarChart3 className="h-5 w-5 text-[#525252]" />
                </div>
                {lastMonthTotal > 0 && (
                  <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md border ${
                    monthOverMonthChange >= 0
                      ? 'bg-[#fef2f2] text-[#ef4444] border-[#e5e5e5]'
                      : 'bg-[#ecfdf5] text-[#10b981] border-[#e5e5e5]'
                  }`}>
                    {monthOverMonthChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    <span>{Math.abs(monthOverMonthChange).toFixed(1)}%</span>
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs text-[#a3a3a3] font-medium uppercase tracking-wider mb-2">Daily Average</p>
                {(() => {
                  const dates = filteredExpenses.map(exp => new Date(exp.date).getTime());
                  const firstDate = dates.length > 0 ? new Date(Math.min(...dates)) : new Date();
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  firstDate.setHours(0, 0, 0, 0);
                  const totalDays = Math.ceil((today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                  const avgDailyToman = totalDays > 0 ? totalToman / totalDays : 0;
                  const avgDailyUsd = totalDays > 0 ? totalUsd / totalDays : 0;
                  return (
                    <>
                      <p className="text-2xl sm:text-3xl font-semibold text-[#171717] tabular-nums" dir="rtl">
                        {formatNumber(avgDailyToman)} <span className="text-lg text-[#a3a3a3]">تومان</span>
                      </p>
                      <p className="text-sm text-[#525252] mt-1.5 font-medium">
                        ${avgDailyUsd.toFixed(2)} USD
                      </p>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Exchange Rate */}
            <ExchangeRateCard />

          </div>

          {/* Insights Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8">
            {/* Top 3 Categories */}
            <div className="relative bg-white rounded-xl p-5 sm:p-6 border border-[#e5e5e5] min-w-0 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-[#fafafa] rounded-lg border border-[#e5e5e5]">
                  <Lightbulb className="h-5 w-5 text-[#525252]" />
                </div>
              </div>
              <p className="text-xs text-[#a3a3a3] font-medium uppercase tracking-wider mb-3">Top Categories</p>
              {(() => {
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const thisMonthExpenses = filteredExpenses.filter(exp => {
                  const expDate = new Date(exp.date);
                  return expDate >= startOfMonth;
                });

                // Use this month's expenses if available, otherwise use all filtered expenses
                const dataToUse = thisMonthExpenses.length > 0 ? thisMonthExpenses : filteredExpenses;

                const monthCategoryTotals = dataToUse.reduce((acc, exp) => {
                  const existing = acc.find(item => item.category === exp.category);
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
                }, [] as Array<{ category: string; name: string; nameFa: string; value: number }>);

                const topThree = monthCategoryTotals.sort((a, b) => b.value - a.value).slice(0, 3);

                return topThree.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs text-[#a3a3a3] font-medium">{thisMonthExpenses.length > 0 ? 'This Month' : 'Overall'}</p>
                    {topThree.map((cat, index) => (
                      <div key={cat.category} className="flex items-center justify-between p-2.5 bg-[#fafafa] rounded-lg border border-[#e5e5e5] hover:border-[#d4d4d4] transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 flex items-center justify-center rounded-md bg-[#0070f3] text-white text-xs font-semibold">{index + 1}</span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[#171717] font-medium text-sm truncate">{cat.name}</span>
                            <span className="text-[#a3a3a3] text-xs truncate" dir="rtl">{cat.nameFa}</span>
                          </div>
                        </div>
                        <span className="font-semibold text-[#171717] text-sm whitespace-nowrap tabular-nums">{formatNumber(cat.value)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#a3a3a3]">No expense data available</p>
                );
              })()}
            </div>

            {/* Highest Single Expense */}
            <div className="relative bg-white rounded-xl p-5 sm:p-6 border border-[#e5e5e5] min-w-0 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-[#fafafa] rounded-lg border border-[#e5e5e5]">
                  <TrendingUp className="h-5 w-5 text-[#525252]" />
                </div>
              </div>
              <p className="text-xs text-[#a3a3a3] font-medium uppercase tracking-wider mb-3">Highest Expense</p>
              {(() => {
                const highestExpense = filteredExpenses.reduce((max, exp) =>
                  exp.price_toman > max.price_toman ? exp : max
                , filteredExpenses[0]);

                return highestExpense ? (
                  <>
                    <p className="text-2xl sm:text-3xl font-semibold text-[#171717] tabular-nums" dir="rtl">
                      {formatNumber(highestExpense.price_toman)} <span className="text-lg text-[#a3a3a3]">تومان</span>
                    </p>
                    <p className="text-sm text-[#525252] mt-1.5 font-medium">
                      ${highestExpense.price_usd.toFixed(2)} USD
                    </p>
                    <div className="mt-3 pt-3 border-t border-[#e5e5e5]">
                      <p className="text-xs text-[#a3a3a3] mb-1">
                        {new Date(highestExpense.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                      </p>
                      <p className="text-sm text-[#171717] font-medium">{getCategoryLabel(highestExpense.category).en}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-[#a3a3a3]">No expenses yet</p>
                );
              })()}
            </div>

            {/* Month over Month Change */}
            <div className="relative bg-white rounded-xl p-5 sm:p-6 border border-[#e5e5e5] min-w-0 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-lg border ${
                  monthOverMonthChange >= 0
                    ? 'bg-[#fef2f2] border-[#e5e5e5]'
                    : 'bg-[#ecfdf5] border-[#e5e5e5]'
                }`}>
                  {monthOverMonthChange >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-[#ef4444]" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-[#10b981]" />
                  )}
                </div>
              </div>
              <p className="text-xs text-[#a3a3a3] font-medium uppercase tracking-wider mb-3">vs Last Month</p>
              {lastMonthTotal > 0 ? (
                <>
                  <p className={`text-2xl sm:text-3xl font-semibold tabular-nums ${
                    monthOverMonthChange >= 0 ? 'text-[#ef4444]' : 'text-[#10b981]'
                  }`}>
                    {monthOverMonthChange >= 0 ? '+' : ''}{monthOverMonthChange.toFixed(1)}%
                  </p>
                  <p className="text-sm text-[#525252] mt-1.5 font-medium">
                    Spending <span className={`font-semibold ${monthOverMonthChange >= 0 ? 'text-[#ef4444]' : 'text-[#10b981]'}`}>{monthOverMonthChange >= 0 ? 'more' : 'less'}</span> than last month
                  </p>
                  <div className="mt-3 pt-3 border-t border-[#e5e5e5] space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#a3a3a3]">This Month</span>
                      <span className="text-[#171717] font-medium tabular-nums">{formatNumber(thisMonthTotalToman)} ت</span>
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
            <div className="relative bg-white rounded-xl p-5 sm:p-6 border border-[#e5e5e5] overflow-hidden mb-6 sm:mb-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#fafafa] rounded-lg border border-[#e5e5e5]">
                  <BarChart3 className="h-4 w-4 text-[#525252]" />
                </div>
                <h2 className="text-lg font-semibold text-[#171717]">Expenses by Category</h2>
              </div>

              <div className="space-y-3">
                {categoryData.map((cat, index) => (
                  <div key={cat.category} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-[#fafafa] rounded-lg border border-[#e5e5e5] hover:border-[#d4d4d4] transition-colors min-w-0 group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm font-semibold text-[#171717] truncate">{cat.name}</span>
                          <span className="text-xs text-[#a3a3a3] truncate" dir="rtl">{cat.nameFa}</span>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          <span className="text-sm font-semibold text-[#171717] whitespace-nowrap tabular-nums" dir="rtl">
                            {formatNumber(cat.value)} تومان
                          </span>
                          <span className="text-xs text-[#a3a3a3] whitespace-nowrap">
                            ${cat.usdValue.toFixed(2)} USD
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-[#e5e5e5] rounded-full h-2">
                        <div
                          className="h-full rounded-full transition-all duration-500 bg-[#0070f3]"
                          style={{
                            width: `${totalToman > 0 ? (cat.value / totalToman) * 100 : 0}%`
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
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-semibold text-[#171717]">Enhanced Analytics</h2>
              <span className="text-sm text-[#a3a3a3]" dir="rtl">نمودارهای پیشرفته</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
              {/* Comparison Chart - This Month vs Last Month */}
              <div className="relative bg-white rounded-xl p-5 sm:p-6 border border-[#e5e5e5] overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-[#fafafa] rounded-lg border border-[#e5e5e5]">
                    <BarChart3 className="h-5 w-5 text-[#525252]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#171717]">Month Comparison</h3>
                    <p className="text-xs text-[#a3a3a3]" dir="rtl">مقایسه ماهانه</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* This Month Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#171717]">
                        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                      <span className="text-sm font-semibold text-[#171717] tabular-nums">{formatNumber(thisMonthTotalToman)} ت</span>
                    </div>
                    <div className="w-full bg-[#e5e5e5] rounded-full h-3">
                      <div
                        className="h-full rounded-full bg-[#0070f3] transition-all duration-500"
                        style={{
                          width: `${Math.max(thisMonthTotalToman, lastMonthTotalToman) > 0 ? (thisMonthTotalToman / Math.max(thisMonthTotalToman, lastMonthTotalToman)) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Last Month Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#525252]">
                        {new Date(new Date().getFullYear(), new Date().getMonth() - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                      <span className="text-sm font-semibold text-[#525252] tabular-nums">{formatNumber(lastMonthTotalToman)} ت</span>
                    </div>
                    <div className="w-full bg-[#e5e5e5] rounded-full h-3">
                      <div
                        className="h-full rounded-full bg-[#d4d4d4] transition-all duration-500"
                        style={{
                          width: `${Math.max(thisMonthTotalToman, lastMonthTotalToman) > 0 ? (lastMonthTotalToman / Math.max(thisMonthTotalToman, lastMonthTotalToman)) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Difference */}
                  <div className="pt-4 border-t border-[#e5e5e5]">
                    {thisMonthTotalToman > 0 && lastMonthTotalToman > 0 ? (
                      <div className="flex items-center justify-between p-3 bg-[#fafafa] rounded-lg border border-[#e5e5e5]">
                        <span className="text-sm text-[#525252]">Difference</span>
                        <div className="flex items-center gap-2">
                          {thisMonthTotalToman > lastMonthTotalToman ? (
                            <TrendingUp className="h-4 w-4 text-[#ef4444]" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-[#10b981]" />
                          )}
                          <span className={`text-sm font-semibold tabular-nums ${
                            thisMonthTotalToman > lastMonthTotalToman ? 'text-[#ef4444]' : 'text-[#10b981]'
                          }`}>
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
              <div className="relative bg-white rounded-xl p-5 sm:p-6 border border-[#e5e5e5] overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-[#fafafa] rounded-lg border border-[#e5e5e5]">
                    <BarChart3 className="h-5 w-5 text-[#525252]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#171717]">Spending Heatmap</h3>
                    <p className="text-xs text-[#a3a3a3]" dir="rtl">نقشه حرارتی هزینه</p>
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
                    const dayExpenses = filteredExpenses.filter(exp => exp.date === dateStr);
                    const dayTotal = dayExpenses.reduce((sum, exp) => sum + exp.price_toman, 0);
                    calendarDays.push({
                      date: day,
                      dateStr,
                      total: dayTotal,
                      count: dayExpenses.length
                    });
                  }

                  // Find max spending for color scaling
                  const maxSpending = Math.max(...calendarDays.filter(d => d.date).map(d => d.total), 1);

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
                      <p className="text-sm text-[#171717] font-medium mb-4">
                        {new Date(displayYear, displayMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>

                      {/* Day labels */}
                      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-3">
                        {dayLabels.map(label => (
                          <div key={label} className="text-center">
                            <p className="text-[10px] text-[#a3a3a3] font-semibold uppercase tracking-wide">{label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Heatmap grid */}
                      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                        {calendarDays.map((day, idx) => (
                          <div key={idx} className="group relative">
                            {day.date ? (
                              <div
                                className="aspect-square rounded-lg cursor-pointer transition-all hover:ring-2 hover:ring-[#0070f3] hover:scale-105 border border-[#e5e5e5]"
                                style={{
                                  backgroundColor: getHeatmapColor(day.total)
                                }}
                                title={`${day.date} - ${day.count} transactions - ${formatNumber(day.total)} ت`}
                              >
                                <div className="flex items-center justify-center h-full">
                                  <span className={`text-xs sm:text-sm font-semibold ${day.total > 0 ? 'text-white' : 'text-[#a3a3a3]'}`}>{day.date}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="aspect-square rounded-lg bg-transparent" />
                            )}

                            {/* Tooltip on hover */}
                            {day.date && (
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white text-[#171717] text-xs px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-[#e5e5e5] shadow-lg">
                                <p className="font-semibold text-[#171717]">{day.count} {day.count === 1 ? 'transaction' : 'transactions'}</p>
                                <p className="text-[#0070f3] font-medium">{formatNumber(day.total)} ت</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Legend */}
                      <div className="mt-5 pt-4 border-t border-[#e5e5e5]">
                        <p className="text-xs text-[#a3a3a3] font-medium mb-3">Spending Intensity</p>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-[#a3a3a3]">Less</span>
                          <div className="flex gap-1.5">
                            <div className="w-4 h-4 rounded-md border border-[#e5e5e5]" style={{ backgroundColor: '#f5f5f5' }} />
                            <div className="w-4 h-4 rounded-md border border-[#e5e5e5]" style={{ backgroundColor: '#cce5ff' }} />
                            <div className="w-4 h-4 rounded-md border border-[#e5e5e5]" style={{ backgroundColor: '#99ccff' }} />
                            <div className="w-4 h-4 rounded-md border border-[#e5e5e5]" style={{ backgroundColor: '#66b3ff' }} />
                            <div className="w-4 h-4 rounded-md border border-[#e5e5e5]" style={{ backgroundColor: '#3b9aff' }} />
                            <div className="w-4 h-4 rounded-md border border-[#e5e5e5]" style={{ backgroundColor: '#0070f3' }} />
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
    </DashboardLayout>
  );
}

