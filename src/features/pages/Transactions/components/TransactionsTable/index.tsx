'use client';

import { useMemo, useRef } from 'react';

import { EXPENSE_CATEGORIES } from '@constants/categories';
import { Calendar, FileText, Loader2, Search, Tag as TagIcon, X } from 'lucide-react';
import type { DatePicker as ReactDatePickerType } from 'react-datepicker';
import type { MultiValue } from 'react-select';
import Select2 from 'react-select';

import Button from '@components/Button';
import DataTable from '@components/DataTable';
import DatePicker from '@components/DatePicker';
import Select from '@components/Select';
import Pulse from '@components/Skeleton';

import { useTags } from '@hooks/use-tags';

import type { Tag } from '@/@types/expense';

import type { TransactionsTableProps } from '../../@types';
import { buildTransactionColumns } from '../../constants';

// ─── TagFilterSelect ──────────────────────────────────────────────────────────

interface TagOption {
  value: number;
  label: string;
}

interface TagFilterSelectProps {
  value: Tag[];
  onChange: (tags: Tag[]) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tagSelectStyles: any = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  menuPortal: (base: any) => ({ ...base, zIndex: 9999, pointerEvents: 'auto' }),
  input: () => ({ color: 'inherit', fontSize: 'inherit', margin: 0, padding: 0 }),
  control: () => ({ minHeight: 'unset', maxHeight: '36px', overflow: 'hidden' }),
  valueContainer: () => ({
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    overflow: 'hidden',
    flexWrap: 'nowrap',
    padding: 0,
  }),
};

function TagFilterSelect({ value, onChange }: TagFilterSelectProps) {
  const { data: allTags = [] } = useTags();

  const options: TagOption[] = allTags.map((t) => ({ value: t.id, label: t.name }));
  const selected: TagOption[] = value.map((t) => ({ value: t.id, label: t.name }));

  const handleChange = (newValue: MultiValue<TagOption>) => {
    const tags = newValue.map((o) => allTags.find((t) => t.id === o.value)).filter(Boolean) as Tag[];
    onChange(tags);
  };

  return (
    <Select2<TagOption, true>
      isMulti
      classNamePrefix="tf"
      value={selected}
      onChange={handleChange}
      options={options}
      placeholder="Tags"
      isSearchable
      closeMenuOnSelect={false}
      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
      menuPosition="fixed"
      unstyled
      styles={tagSelectStyles}
      components={{
        DropdownIndicator: () => null,
        IndicatorSeparator: () => null,
        ClearIndicator: () => null,
      }}
      classNames={{
        control: ({ isFocused }) =>
          `border rounded-lg px-3 py-2 text-sm transition-all cursor-pointer flex items-center bg-background ${
            isFocused ? 'border-blue' : 'border-border-subtle'
          }`,
        valueContainer: () => 'gap-1',
        placeholder: () => 'text-text-muted text-sm whitespace-nowrap',
        input: () => 'text-text-primary text-sm shrink-0 min-w-0',
        menu: () => 'border-border-subtle bg-background mt-1 rounded-lg border py-1 shadow-lg min-w-[160px]',
        option: ({ isFocused }) =>
          `flex items-center gap-2 px-3 py-2 text-xs text-text-primary cursor-pointer transition-colors ${
            isFocused ? 'bg-background-elevated' : ''
          }`,
        multiValue: () =>
          'border-border-subtle bg-background-elevated text-text-secondary flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium',
        multiValueLabel: () => 'flex items-center gap-1',
        multiValueRemove: () =>
          'text-text-muted hover:text-text-primary ml-0.5 rounded p-0.5 transition-colors cursor-pointer',
        noOptionsMessage: () => 'text-text-muted px-4 py-3 text-xs',
      }}
    />
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatChipDate(iso: string) {
  const [, mm, dd] = iso.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(mm, 10) - 1]} ${parseInt(dd, 10)}`;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

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

// ─── Main component ───────────────────────────────────────────────────────────

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
  // References
  const toPickerRef = useRef<ReactDatePickerType>(null);

  // Derived state
  const { data: allTags = [] } = useTags();
  const selectedTagObjects: Tag[] = useMemo(
    () => (filters.tagIds ?? []).map((id) => allTags.find((t) => t.id === id)).filter(Boolean) as Tag[],
    [filters.tagIds, allTags]
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (descInput) count++;
    if (filters.category) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    count += (filters.tagIds ?? []).length;
    return count;
  }, [descInput, filters]);

  const hasActiveFilter = activeFilterCount > 0;

  const categoryLabel = useMemo(
    () => EXPENSE_CATEGORIES.find((c) => c.value === filters.category)?.label,
    [filters.category]
  );

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

  const handleClearAll = () => {
    onFiltersChange(() => ({}));
    onDescInputChange('');
  };

  return (
    <DataTable
      data={expenses}
      columns={transactionColumns}
      onRowClick={onRowClick}
      getRowId={(row) => String(row.id)}
      minimal={true}
      minWidth="min-w-[560px]"
      filterBar={
        <div className="border-border-subtle border-b">
          {/* Row 1: Search */}
          <div className="border-border-subtle border-b px-4 pt-3 pb-2.5">
            <div className="border-border-subtle bg-background text-text-primary focus-within:border-blue flex items-center gap-2 rounded-lg border px-3 py-2 transition-all">
              <Search className="text-text-muted h-4 w-4 shrink-0" />
              <input
                type="text"
                placeholder="Search by description..."
                value={descInput}
                onChange={(e) => onDescInputChange(e.target.value)}
                className="placeholder:text-text-muted w-full bg-transparent text-sm outline-none"
              />
              {descInput && (
                <button
                  onClick={() => onDescInputChange('')}
                  className="text-text-muted hover:text-text-primary rounded p-0.5 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Filter controls */}
          <div className="flex flex-wrap items-center gap-2 px-4 py-2.5">
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
            <div className="border-border-subtle bg-background focus-within:border-blue flex min-w-[200px] flex-1 items-center gap-1 rounded-lg border px-2 py-1 transition-all">
              <Calendar className="text-text-muted h-3.5 w-3.5 shrink-0" />
              <DatePicker
                value={filters.dateFrom ?? ''}
                onChange={(date) => {
                  onFiltersChange((f) => ({ ...f, dateFrom: date || undefined }));
                  if (date) setTimeout(() => toPickerRef.current?.setOpen(true), 50);
                }}
                placeholder="From"
                isClearable
                wrapperClassName="flex-1 min-w-[80px] [&_input]:border-0 [&_input]:bg-transparent [&_input]:px-1 [&_input]:py-0 [&_input]:shadow-none [&_input]:rounded-none"
              />
              <span className="text-text-muted shrink-0 text-xs">→</span>
              <DatePicker
                ref={toPickerRef}
                value={filters.dateTo ?? ''}
                onChange={(date) => onFiltersChange((f) => ({ ...f, dateTo: date || undefined }))}
                placeholder="To"
                isClearable
                wrapperClassName="flex-1 min-w-[80px] [&_input]:border-0 [&_input]:bg-transparent [&_input]:px-1 [&_input]:py-0 [&_input]:shadow-none [&_input]:rounded-none"
              />
            </div>

            {/* Tag filter */}
            <div className="min-w-[120px] flex-1">
              <TagFilterSelect
                value={selectedTagObjects}
                onChange={(tags) =>
                  onFiltersChange((f) => ({
                    ...f,
                    tagIds: tags.length ? tags.map((t) => t.id) : undefined,
                  }))
                }
              />
            </div>

            {/* Clear all */}
            {hasActiveFilter && (
              <button
                onClick={handleClearAll}
                className="border-border-subtle text-text-secondary hover:bg-background-elevated flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors"
                title="Clear all filters"
              >
                <X className="h-3.5 w-3.5" />
                <span>Clear</span>
                <span className="bg-background-elevated text-text-secondary rounded px-1 py-0.5 text-[10px] leading-none font-semibold">
                  {activeFilterCount}
                </span>
              </button>
            )}
          </div>

          {/* Row 3: Active filter chips */}
          {hasActiveFilter &&
            (categoryLabel || filters.dateFrom || filters.dateTo || selectedTagObjects.length > 0) && (
              <div className="flex flex-wrap items-center gap-1.5 px-4 pb-2.5">
                {/* Category chip */}
                {categoryLabel && (
                  <span className="border-border-subtle bg-background-secondary text-text-secondary flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs">
                    {categoryLabel}
                    <button
                      onClick={() => onFiltersChange((f) => ({ ...f, category: undefined }))}
                      className="text-text-muted hover:text-text-primary ml-0.5 transition-colors"
                      aria-label={`Remove category filter: ${categoryLabel}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {/* Date chip */}
                {(filters.dateFrom || filters.dateTo) && (
                  <span className="border-border-subtle bg-background-secondary text-text-secondary flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs">
                    <Calendar className="h-3 w-3 shrink-0" />
                    {filters.dateFrom ? formatChipDate(filters.dateFrom) : '…'}
                    {' – '}
                    {filters.dateTo ? formatChipDate(filters.dateTo) : '…'}
                    <button
                      onClick={() => onFiltersChange((f) => ({ ...f, dateFrom: undefined, dateTo: undefined }))}
                      className="text-text-muted hover:text-text-primary ml-0.5 transition-colors"
                      aria-label="Remove date filter"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {/* Tag chips */}
                {selectedTagObjects.map((tag) => (
                  <span
                    key={tag.id}
                    className="border-border-subtle bg-background-secondary text-text-secondary flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs"
                  >
                    <TagIcon className="h-3 w-3 shrink-0" />
                    {tag.name}
                    <button
                      onClick={() =>
                        onFiltersChange((f) => ({
                          ...f,
                          tagIds: f.tagIds?.filter((id) => id !== tag.id),
                        }))
                      }
                      className="text-text-muted hover:text-text-primary ml-0.5 transition-colors"
                      aria-label={`Remove tag filter: ${tag.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
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
