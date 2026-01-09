'use client';

import { useEffect, useMemo, useState } from 'react';

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
import Loading from '@components/Loading';

export default function ReportsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('ALL_TIME');

  useEffect(() => {
    const fetchExpenses = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/expenses');
        if (response.ok) {
          const data = await response.json();
          setExpenses(Array.isArray(data) ? data : data.expenses || []);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchExpenses();
  }, []);

  const filteredExpenses = useMemo(() => {
    return filterExpensesByDateRange(expenses, dateRange);
  }, [expenses, dateRange]);

  const chartGranularity = useMemo(() => {
    return getChartGranularity(dateRange);
  }, [dateRange]);

  return (
    <div className="min-h-screen bg-[#ffffff]">
      <div className="mx-auto max-w-[1600px] px-6 py-8">
        {/* Page Header */}
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-[#171717] sm:text-2xl md:text-3xl">Reports</h1>
            <p className="mt-1 text-xs text-[#a3a3a3] sm:text-sm">Analyze your spending patterns</p>
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

        {/* Statistics */}
        {!isLoading && (
          <div className="mb-8">
            <ExpenseStats expenses={filteredExpenses} />
          </div>
        )}

        {/* Charts */}
        {!isLoading && filteredExpenses.length > 0 ? (
          <div className="relative">
            <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-2">
                  <TrendingUp className="h-4 w-4 text-[#0070f3]" />
                </div>
                <h2 className="text-lg font-semibold text-[#171717]">Spending Analytics</h2>
              </div>
              <ExpenseCharts expenses={filteredExpenses} granularity={chartGranularity} />
            </div>
          </div>
        ) : isLoading ? (
          <Loading message="Loading reports..." />
        ) : (
          <div className="rounded-xl border border-[#e5e5e5] bg-white p-16 text-center shadow-sm">
            <div className="mx-auto flex max-w-md flex-col items-center gap-4">
              <div className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-4">
                <Sparkles className="h-10 w-10 text-[#a3a3a3]" />
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-[#171717]">No data available</h3>
                <p className="text-[#a3a3a3]">
                  No transactions found for the selected period. Try adjusting your date range.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
