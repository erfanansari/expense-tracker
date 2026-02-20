'use client';

import { useMemo, useState } from 'react';

import { Download, Filter, Sparkles, TrendingUp } from 'lucide-react';

import { type Expense } from '@types';

import DateRangeSelector, {
  type DateRange,
  filterExpensesByDateRange,
  getChartGranularity,
} from '@features/expenses/components/DateRangeSelector';
import { ExpenseCharts } from '@features/expenses/components/ExpenseCharts';
import ExpenseStats from '@features/expenses/components/ExpenseStats';

import Button from '@components/Button';

import { useAllExpenses } from '@/hooks/use-all-expenses';

function Pulse({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-sm bg-zinc-300 ${className}`} aria-label="Loading" />;
}

function ReportsSkeleton() {
  return (
    <>
      {/* 3 stat card skeletons — matches ExpenseStats md:grid-cols-3 */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border-border-subtle bg-background rounded-xl border p-5 shadow-sm sm:p-6">
            {/* Icon box + badge row */}
            <div className="mb-4 flex items-center justify-between">
              <Pulse className="h-9 w-9 rounded-lg" />
              <Pulse className="h-6 w-20 rounded-full" />
            </div>
            {/* Label */}
            <Pulse className="mb-3 h-3 w-24" />
            {/* Value */}
            <Pulse className="mb-2 h-8 w-3/4" />
            {/* Subtitle */}
            <Pulse className="h-4 w-2/5" />
          </div>
        ))}
      </div>

      {/* Chart card skeleton */}
      <div className="border-border-subtle bg-background rounded-xl border p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <Pulse className="h-8 w-8 rounded-lg" />
          <Pulse className="h-5 w-44" />
        </div>
        <Pulse className="mb-6 h-52 w-full sm:h-72" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Pulse className="h-44" />
          <Pulse className="h-44" />
        </div>
      </div>
    </>
  );
}

export default function ReportsPage() {
  const { data: expensesData, isLoading } = useAllExpenses();
  const expenses: Expense[] = expensesData ?? [];
  const [dateRange, setDateRange] = useState<DateRange>('ALL_TIME');

  const filteredExpenses = useMemo(() => {
    return filterExpensesByDateRange(expenses, dateRange);
  }, [expenses, dateRange]);

  const chartGranularity = useMemo(() => {
    return getChartGranularity(dateRange);
  }, [dateRange]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1600px] px-6 py-8">
        {/* Page Header */}
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-text-primary text-xl font-bold sm:text-2xl md:text-3xl">Reports</h1>
            <p className="text-text-muted mt-1 text-xs sm:text-sm">Analyze your spending patterns</p>
          </div>
          <div className="flex flex-row items-center gap-2 sm:gap-3">
            <DateRangeSelector value={dateRange} onChange={setDateRange} />
            <Button variant="outline" className="shrink-0">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
            <Button variant="primary" className="shrink-0">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <ReportsSkeleton />
        ) : (
          <>
            {/* Statistics */}
            <div className="mb-8">
              <ExpenseStats expenses={filteredExpenses} />
            </div>

            {/* Charts */}
            {filteredExpenses.length > 0 ? (
              <div className="relative">
                <div className="border-border-subtle bg-background rounded-xl border p-6 shadow-sm sm:p-8">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="border-border-subtle bg-background-secondary rounded-lg border p-2">
                      <TrendingUp className="text-blue h-4 w-4" />
                    </div>
                    <h2 className="text-text-primary text-lg font-semibold">Spending Analytics</h2>
                  </div>
                  <ExpenseCharts expenses={filteredExpenses} granularity={chartGranularity} />
                </div>
              </div>
            ) : (
              <div className="border-border-subtle bg-background rounded-xl border p-16 text-center shadow-sm">
                <div className="mx-auto flex max-w-md flex-col items-center gap-4">
                  <div className="border-border-subtle bg-background-secondary rounded-xl border p-4">
                    <Sparkles className="text-text-muted h-10 w-10" />
                  </div>
                  <div>
                    <h3 className="text-text-primary mb-2 text-lg font-semibold">No data available</h3>
                    <p className="text-text-muted">
                      No transactions found for the selected period. Try adjusting your date range.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
