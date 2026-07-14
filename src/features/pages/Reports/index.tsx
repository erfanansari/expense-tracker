'use client';

import { useMemo, useState } from 'react';

import { useTranslations } from 'next-intl';

import { getAllExpensesKeyGenerator } from '@api/getAllExpensesQuery';
import type { GetAllExpensesResponse } from '@api/getAllExpensesQuery';
import { useQuery } from '@tanstack/react-query';
import { Download, Filter } from 'lucide-react';

import { type Expense } from '@types';

import { ApiError } from '@core/errors';

import DateRangeSelector, {
  type DateRange,
  filterExpensesByDateRange,
  getChartGranularity,
} from '@features/expenses/components/DateRangeSelector';

import Button from '@components/Button';
import ErrorState from '@components/ErrorState';
import Pulse from '@components/Skeleton';

import { useToast } from '@stores/toast';

import type { Tag } from '@/@types/expense';
import { buildExportFilename, downloadFile, expensesToCsvString } from '@/utils/export';

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
  const t = useTranslations('pages.reports');
  // States
  const [dateRange, setDateRange] = useState<DateRange>('ALL_TIME');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterTags, setFilterTags] = useState<Tag[]>([]);
  const [filterCategoryIds, setFilterCategoryIds] = useState<number[]>([]);
  const { showToast } = useToast();

  // Queries
  const {
    data: expensesData,
    isLoading,
    error,
    refetch,
  } = useQuery<GetAllExpensesResponse>({
    queryKey: getAllExpensesKeyGenerator(),
  });

  // Variables
  const expenses: Expense[] = expensesData ?? [];
  // 401 means the auth redirect is already in flight; don't flash an error banner.
  const loadError = error instanceof ApiError && error.status === 401 ? null : error;
  const activeFilterCount = filterTags.length + filterCategoryIds.length;

  // Memos
  const filteredExpenses = useMemo(() => {
    let result = filterExpensesByDateRange(expenses, dateRange);
    if (filterCategoryIds.length > 0) {
      result = result.filter((e) => filterCategoryIds.includes(e.category.id));
    }
    if (filterTags.length > 0) {
      const tagIds = new Set(filterTags.map((t) => t.id));
      result = result.filter((e) => e.tags?.some((t) => tagIds.has(t.id)));
    }
    return result;
  }, [expenses, dateRange, filterCategoryIds, filterTags]);

  const chartGranularity = useMemo(() => getChartGranularity(dateRange), [dateRange]);

  const handleResetFilters = () => {
    setFilterTags([]);
    setFilterCategoryIds([]);
  };

  const handleClearAllFilters = () => {
    handleResetFilters();
    setDateRange('ALL_TIME');
  };

  const handleExportCsv = () => {
    const csv = expensesToCsvString(filteredExpenses);
    downloadFile(csv, buildExportFilename('kharji-expenses', dateRange, 'csv'), 'text/csv;charset=utf-8;');
    showToast(t('exportSuccess', { count: filteredExpenses.length }), 'success');
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1600px] px-6 py-8">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between gap-4 sm:mb-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-text-primary text-xl font-semibold sm:text-2xl md:text-3xl">{t('title')}</h1>
            <p className="text-text-muted mt-1 text-xs sm:text-sm">{t('subtitle')}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Date range — inline on desktop, dropped below on mobile */}
            <div className="hidden w-[150px] sm:block">
              <DateRangeSelector value={dateRange} onChange={setDateRange} />
            </div>
            <div className="relative">
              <Button
                variant="outline"
                className="shrink-0"
                onClick={() => setIsFilterOpen((v) => !v)}
                aria-expanded={isFilterOpen}
                aria-haspopup="dialog"
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">{t('filterButton')}</span>
                {activeFilterCount > 0 && (
                  <span className="bg-blue text-background ms-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              <ReportsFilterPopover
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                selectedTags={filterTags}
                selectedCategoryIds={filterCategoryIds}
                onTagsChange={setFilterTags}
                onCategoriesChange={setFilterCategoryIds}
                onReset={handleResetFilters}
              />
            </div>
            <Button
              variant="primary"
              className="shrink-0"
              onClick={handleExportCsv}
              disabled={filteredExpenses.length === 0}
              title={t('exportCsvTitle')}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">{t('exportCsv')}</span>
            </Button>
          </div>
        </div>

        {/* Mobile-only date range row */}
        <div className="mb-6 sm:hidden">
          <DateRangeSelector value={dateRange} onChange={setDateRange} />
        </div>

        {isLoading && <ReportsSkeleton />}
        {!isLoading &&
          (loadError ? (
            <div className="border-border-subtle bg-background rounded-xl border shadow-sm">
              <ErrorState title={t('loadError')} description={loadError.message} onRetry={() => refetch()} />
            </div>
          ) : (
            <>
              <ReportsStats expenses={filteredExpenses} />
              <ReportsCharts
                expenses={filteredExpenses}
                granularity={chartGranularity}
                hasAnyExpenses={expenses.length > 0}
                onClearFilters={handleClearAllFilters}
              />
            </>
          ))}
      </div>
    </div>
  );
};

export default ReportsPage;
