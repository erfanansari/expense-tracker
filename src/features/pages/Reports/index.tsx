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

import type { Tag } from '@/@types/expense';

import ExportModal from './components/ExportModal';
import ReportsCharts from './components/ReportsCharts';
import ReportsFilterPopover from './components/ReportsFilterPopover';
import ReportsStats from './components/ReportsStats';

function ReportsSkeleton() {
  return (
    <>
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
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterTags, setFilterTags] = useState<Tag[]>([]);
  const [filterCategories, setFilterCategories] = useState<string[]>([]);

  // Queries
  const { data: expensesData, isLoading } = useAllExpenses();

  // Variables
  const expenses: Expense[] = expensesData ?? [];
  const activeFilterCount = filterTags.length + filterCategories.length;

  // Memos
  const filteredExpenses = useMemo(() => {
    let result = filterExpensesByDateRange(expenses, dateRange);
    if (filterCategories.length > 0) {
      result = result.filter((e) => filterCategories.includes(e.category));
    }
    if (filterTags.length > 0) {
      const tagIds = new Set(filterTags.map((t) => t.id));
      result = result.filter((e) => e.tags?.some((t) => tagIds.has(t.id)));
    }
    return result;
  }, [expenses, dateRange, filterCategories, filterTags]);

  const chartGranularity = useMemo(() => getChartGranularity(dateRange), [dateRange]);

  const handleResetFilters = () => {
    setFilterTags([]);
    setFilterCategories([]);
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1600px] px-6 py-8">
        {/* Page Header */}
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-text-primary text-xl font-semibold sm:text-2xl md:text-3xl">Reports</h1>
            <p className="text-text-muted mt-1 text-xs sm:text-sm">Analyze your spending patterns</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <DateRangeSelector value={dateRange} onChange={setDateRange} />
            <div className="relative">
              <Button
                variant="outline"
                className="shrink-0"
                onClick={() => setIsFilterOpen((v) => !v)}
                aria-expanded={isFilterOpen}
                aria-haspopup="dialog"
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filter</span>
                {activeFilterCount > 0 && (
                  <span className="bg-blue text-background ml-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              <ReportsFilterPopover
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                selectedTags={filterTags}
                selectedCategories={filterCategories}
                onTagsChange={setFilterTags}
                onCategoriesChange={setFilterCategories}
                onReset={handleResetFilters}
              />
            </div>
            <Button variant="primary" className="shrink-0" onClick={() => setIsExportOpen(true)}>
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

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        expenses={filteredExpenses}
        dateRange={dateRange}
      />
    </div>
  );
};

export default ReportsPage;
