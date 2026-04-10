import { useMemo } from 'react';

import { EXPENSE_CATEGORIES } from '@constants/categories';
import { FileText, Loader2, X } from 'lucide-react';

import Button from '@components/Button';
import DataTable from '@components/DataTable';
import DatePicker from '@components/DatePicker';
import Select from '@components/Select';
import Pulse from '@components/Skeleton';

import type { TransactionsTableProps } from '../../@types';
import { buildTransactionColumns } from '../../constants';

function TransactionsSkeleton() {
  return (
    <div className="border-border-subtle bg-background overflow-hidden rounded-xl border shadow-sm">
      <div className="bg-background-secondary px-4 py-3.5 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <Pulse className="h-3 w-24" />
          <Pulse className="hidden h-3 w-20 sm:block" />
          <Pulse className="hidden h-3 w-16 sm:block" />
          <Pulse className="h-3 w-16" />
          <Pulse className="hidden h-3 w-14 sm:block" />
        </div>
      </div>
      {[...Array(8)].map((_, i) => (
        <div key={i} className="border-border-subtle border-t px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Pulse className="h-4 w-40" />
              <Pulse className="h-3 w-24" />
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
              <Pulse className="h-4 w-24" />
              <Pulse className="h-3 w-16" />
            </div>
            <div className="hidden items-center justify-center gap-1 sm:flex">
              <Pulse className="h-8 w-8 rounded-lg" />
              <Pulse className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const TransactionsTable = ({
  expenses,
  isLoading,
  error,
  filters,
  descInput,
  onDescInputChange,
  onFiltersChange,
  onRowClick,
  onEdit,
  onDelete,
  deletingId,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: TransactionsTableProps) => {
  // Variables
  const hasActiveFilter = !!(filters.description || filters.category || filters.dateFrom || filters.dateTo);

  // Memos
  const transactionColumns = useMemo(
    () => buildTransactionColumns(onEdit, onDelete, deletingId),
    [onEdit, onDelete, deletingId]
  );

  if (isLoading && expenses.length === 0) {
    return <TransactionsSkeleton />;
  }

  if (error && expenses.length === 0) {
    return (
      <div className="border-border-subtle bg-background relative rounded-xl border p-16 text-center shadow-sm">
        <div className="border-danger bg-danger-light mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl border">
          <FileText className="text-danger h-8 w-8" />
        </div>
        <p className="text-danger font-medium">{error.message}</p>
      </div>
    );
  }

  return (
    <DataTable
      data={expenses}
      columns={transactionColumns}
      onRowClick={onRowClick}
      getRowId={(row) => String(row.id)}
      minimal={true}
      minWidth="min-w-[560px]"
      filterBar={
        <div className="border-border-subtle flex flex-wrap items-center gap-2 border-b px-4 py-3">
          {/* Description */}
          <input
            type="text"
            placeholder="Search transactions..."
            value={descInput}
            onChange={(e) => onDescInputChange(e.target.value)}
            className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue min-w-[140px] flex-[2] rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none"
          />
          {/* Category */}
          <Select
            value={filters.category ?? ''}
            onChange={(val) => onFiltersChange((f) => ({ ...f, category: val || undefined }))}
            options={[
              { value: '', label: 'All categories' },
              ...EXPENSE_CATEGORIES.map((c) => ({ value: c.value, label: c.label })),
            ]}
            placeholder="All categories"
            className="min-w-[130px] flex-1"
          />
          {/* Date range */}
          <div className="flex min-w-[200px] flex-1 flex-wrap items-center gap-1.5">
            <DatePicker
              value={filters.dateFrom ?? ''}
              onChange={(date) => onFiltersChange((f) => ({ ...f, dateFrom: date || undefined }))}
              placeholder="From"
              isClearable
              wrapperClassName="min-w-[90px] flex-1"
            />
            <span className="text-text-muted shrink-0 text-xs">–</span>
            <DatePicker
              value={filters.dateTo ?? ''}
              onChange={(date) => onFiltersChange((f) => ({ ...f, dateTo: date || undefined }))}
              placeholder="To"
              isClearable
              wrapperClassName="min-w-[90px] flex-1"
            />
          </div>
          {/* Clear all */}
          {hasActiveFilter && (
            <button
              onClick={() => {
                onFiltersChange(() => ({}));
                onDescInputChange('');
              }}
              className="text-text-muted hover:text-text-primary flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs transition-colors"
              title="Clear filters"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>
      }
      emptyState={
        <div className="flex flex-col items-center gap-2">
          {isLoading && <Loader2 className="text-text-muted h-6 w-6 animate-spin" />}
          {!isLoading && hasActiveFilter && (
            <>
              <p className="text-text-secondary font-medium">No transactions found</p>
              <p className="text-text-muted text-sm">Try adjusting your filters</p>
            </>
          )}
          {!isLoading && !hasActiveFilter && (
            <>
              <FileText className="text-text-muted h-8 w-8" />
              <p className="text-text-secondary font-medium">No transactions yet</p>
              <p className="text-text-muted text-sm">Add your first transaction above!</p>
            </>
          )}
        </div>
      }
      footer={
        <>
          {hasNextPage && (
            <div className="mt-4">
              <Button onClick={onLoadMore} disabled={isFetchingNextPage} variant="outline" className="w-full">
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
          {!hasNextPage && expenses.length > 0 && (
            <div className="text-text-muted mt-6 flex items-center justify-center gap-2 py-4">
              <div className="bg-border-subtle h-px w-12" />
              <p className="text-sm">End of transactions</p>
              <div className="bg-border-subtle h-px w-12" />
            </div>
          )}
        </>
      }
    />
  );
};

export default TransactionsTable;
