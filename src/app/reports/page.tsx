'use client';

import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@components/DashboardLayout';
import { ExpenseCharts } from '@features/expenses/components/expense-charts';
import { ExpenseStats } from '@features/expenses/components/expense-stats';
import Loading from '@components/Loading';
import { DateRangeSelector, type DateRange, filterExpensesByDateRange, getChartGranularity } from '@features/expenses/components/date-range-selector';
import { type Expense } from '@types';
import { BarChart3, Download, Filter, Sparkles, TrendingUp } from 'lucide-react';

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
          setExpenses(Array.isArray(data) ? data : (data.expenses || []));
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
    <DashboardLayout>
      <div className="min-h-screen bg-[#ffffff]">
        <div className="max-w-[1600px] mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#171717]">Reports</h1>
              <p className="text-xs sm:text-sm text-[#a3a3a3] mt-1">Analyze your spending patterns</p>
            </div>
            <div className="flex flex-row items-center gap-2 sm:gap-3">
              <DateRangeSelector value={dateRange} onChange={setDateRange} />
              <button className="px-3 sm:px-4 py-2.5 bg-white hover:bg-[#f5f5f5] border border-[#e5e5e5] rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 group flex-shrink-0">
                <Filter className="h-4 w-4 text-[#a3a3a3] group-hover:text-[#171717] transition-colors" />
                <span className="hidden sm:inline text-[#525252] group-hover:text-[#171717] transition-colors">Filter</span>
              </button>
              <button className="px-3 sm:px-4 py-2.5 bg-[#000000] hover:bg-[#171717] rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm flex-shrink-0">
                <Download className="h-4 w-4 text-white" />
                <span className="hidden sm:inline text-white">Export</span>
              </button>
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
              <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#e5e5e5] shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-[#fafafa] rounded-lg border border-[#e5e5e5]">
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
            <div className="bg-white rounded-xl p-16 border border-[#e5e5e5] shadow-sm text-center">
              <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
                <div className="p-4 bg-[#fafafa] rounded-xl border border-[#e5e5e5]">
                  <Sparkles className="h-10 w-10 text-[#a3a3a3]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#171717] mb-2">No data available</h3>
                  <p className="text-[#a3a3a3]">No transactions found for the selected period. Try adjusting your date range.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}



