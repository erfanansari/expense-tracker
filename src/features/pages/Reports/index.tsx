'use client';

import { useMemo, useState } from 'react';

import { Download, Filter } from 'lucide-react';

import { type Expense } from '@types';

import DateRangeSelector, {
  type DateRange,
  filterExpensesByDateRange,
  getChartGranularity,
} from '@features/expenses/components/DateRangeSelector';

import Button from '@components/Button';
import Pulse from '@components/Skeleton';

import { useAllExpenses } from '@hooks/use-all-expenses';

import ReportsCharts from './components/ReportsCharts';
import ReportsStats from './components/ReportsStats';

function ReportsSkeleton() {
  return (
    <>
      {/* 3 stat card skeletons */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border-border-subtle bg-background rounded-xl border p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <Pulse className="h-9 w-9 rounded-lg" />
              <Pulse className="h-6 w-20 rounded-full" />
            </div>
            <Pulse className="mb-3 h-3 w-24" />
            <Pulse className="mb-2 h-8 w-3/4" />
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

const ReportsPage = () => {
  // States
  const [dateRange, setDateRange] = useState<DateRange>('ALL_TIME');

  // Queries
  const { data: expensesData, isLoading } = useAllExpenses();

  // Variables
  const expenses: Expense[] = expensesData ?? [];

  // Memos
  const filteredExpenses = useMemo(() => filterExpensesByDateRange(expenses, dateRange), [expenses, dateRange]);
  const chartGranularity = useMemo(() => getChartGranularity(dateRange), [dateRange]);

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
            <ReportsStats expenses={filteredExpenses} />
            <ReportsCharts expenses={filteredExpenses} granularity={chartGranularity} />
          </>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
