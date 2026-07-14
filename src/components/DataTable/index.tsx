'use client';

import React, { useState } from 'react';

import { useTranslations } from 'next-intl';

import {
  type ColumnDef,
  type ColumnMeta,
  type FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  type RowData,
  useReactTable,
} from '@tanstack/react-table';
import { Inbox, X } from 'lucide-react';

import DatePicker from '@components/DatePicker';
import EmptyState from '@components/EmptyState';
import Select, { type SelectOption } from '@components/Select';

// ─── Module augmentation for typed column meta & custom filter fns ────────────
declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filter?: FilterConfig;
    align?: 'start' | 'end' | 'center';
    widthClass?: string;
  }

  interface FilterFns {
    dateRange: FilterFn<unknown>;
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────
export type FilterConfig =
  | { type: 'text'; placeholder?: string }
  | { type: 'select'; options: SelectOption[]; placeholder?: string }
  | { type: 'dateRange' }
  | { type: 'none' };

export interface DataTableProps<TData extends RowData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  onRowClick?: (row: TData) => void;
  getRowId?: (row: TData) => string;
  /** Suppresses filter toolbar — for mini tables like Overview */
  minimal?: boolean;
  /** e.g. 'min-w-[560px]' */
  minWidth?: string;
  emptyState?: React.ReactNode;
  /** Rendered outside the card — for "Load More" button etc. */
  footer?: React.ReactNode;
  /** Rendered inside card top — for title bars */
  header?: React.ReactNode;
  /**
   * Rendered above the scroll area as a flex-wrap bar — best for mobile-friendly filters.
   * Wrap your content in a div with border-b padding etc.
   */
  filterBar?: React.ReactNode;
  /**
   * Rendered as a second <tr> inside <thead> — use <th> cells so column
   * widths from table-fixed layout align automatically with the data columns.
   */
  filterRow?: React.ReactNode;
}

// ─── Custom filter functions ──────────────────────────────────────────────────
const dateRangeFilter: FilterFn<unknown> = (row, columnId, value) => {
  const [from, to] = value as [string | null, string | null];
  const cellDate = row.getValue<string>(columnId);
  if (!cellDate) return true;
  if (from && cellDate < from) return false;
  if (to && cellDate > to) return false;
  return true;
};

// ─── Filter toolbar ───────────────────────────────────────────────────────────
interface FilterState {
  [columnId: string]: string | [string | null, string | null] | undefined;
}

function FilterToolbar<TData extends RowData>({
  columns,
  filterState,
  setFilterState,
  table,
}: {
  columns: ColumnDef<TData, unknown>[];
  filterState: FilterState;
  setFilterState: (state: FilterState) => void;
  table: ReturnType<typeof useReactTable<TData>>;
}) {
  const filterColumns = columns.filter((col) => {
    const meta = col.meta as ColumnMeta<TData, unknown> | undefined;
    return meta?.filter && meta.filter.type !== 'none';
  });

  if (filterColumns.length === 0) return null;

  const hasActiveFilter = Object.values(filterState).some((v) => {
    if (Array.isArray(v)) return v[0] !== null || v[1] !== null;
    return v !== '' && v !== undefined;
  });

  const clearAll = () => {
    const cleared: FilterState = {};
    filterColumns.forEach((col) => {
      const id =
        (col as { id?: string; accessorKey?: string }).id ?? (col as { accessorKey?: string }).accessorKey ?? '';
      const meta = col.meta as ColumnMeta<TData, unknown> | undefined;
      cleared[id] = meta?.filter?.type === 'dateRange' ? [null, null] : '';
    });
    setFilterState(cleared);
    table.resetColumnFilters();
  };

  return (
    <div className="border-border-subtle flex flex-wrap items-center gap-3 border-b px-4 py-3">
      {filterColumns.map((col) => {
        const id =
          (col as { id?: string; accessorKey?: string }).id ?? (col as { accessorKey?: string }).accessorKey ?? '';
        const meta = col.meta as ColumnMeta<TData, unknown> | undefined;
        const filterConfig = meta?.filter;
        if (!filterConfig || filterConfig.type === 'none') return null;

        const column = table.getColumn(id);

        if (filterConfig.type === 'text') {
          return (
            <input
              key={id}
              type="text"
              placeholder={filterConfig.placeholder ?? `Search...`}
              value={(filterState[id] as string) ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                setFilterState({ ...filterState, [id]: val });
                column?.setFilterValue(val || undefined);
              }}
              className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue max-w-[240px] min-w-[160px] flex-1 rounded-lg border px-3 py-1.5 text-sm transition-all focus:outline-none"
            />
          );
        }

        if (filterConfig.type === 'select') {
          const allOption: SelectOption = { value: '', label: filterConfig.placeholder ?? 'All' };
          const opts = [allOption, ...filterConfig.options];
          return (
            <Select
              key={id}
              value={(filterState[id] as string) ?? ''}
              onChange={(val) => {
                setFilterState({ ...filterState, [id]: val });
                column?.setFilterValue(val || undefined);
              }}
              options={opts}
              placeholder={filterConfig.placeholder ?? 'All'}
              className="max-w-[200px] min-w-[140px] flex-1"
            />
          );
        }

        if (filterConfig.type === 'dateRange') {
          const range = (filterState[id] as [string | null, string | null]) ?? [null, null];
          return (
            <div key={id} className="flex min-w-[280px] flex-1 items-center gap-2">
              <DatePicker
                value={range[0] ?? ''}
                onChange={(date) => {
                  const newRange: [string | null, string | null] = [date || null, range[1]];
                  setFilterState({ ...filterState, [id]: newRange });
                  column?.setFilterValue(newRange[0] || newRange[1] ? newRange : undefined);
                }}
              />
              <span className="text-text-muted text-sm">–</span>
              <DatePicker
                value={range[1] ?? ''}
                onChange={(date) => {
                  const newRange: [string | null, string | null] = [range[0], date || null];
                  setFilterState({ ...filterState, [id]: newRange });
                  column?.setFilterValue(newRange[0] || newRange[1] ? newRange : undefined);
                }}
              />
            </div>
          );
        }

        return null;
      })}

      {hasActiveFilter && (
        <button
          onClick={clearAll}
          className="text-text-muted hover:text-text-primary flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </button>
      )}
    </div>
  );
}

// ─── Main DataTable ───────────────────────────────────────────────────────────
const DataTable = <TData extends RowData>({
  data,
  columns,
  onRowClick,
  getRowId,
  minimal = false,
  minWidth,
  emptyState,
  footer,
  header,
  filterBar,
  filterRow,
}: DataTableProps<TData>) => {
  const t = useTranslations('common');
  const [filterState, setFilterState] = useState<FilterState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: {
      dateRange: dateRangeFilter as FilterFn<TData>,
    },
    getRowId,
  });

  const hasFilters =
    !minimal &&
    columns.some((col) => {
      const meta = col.meta as ColumnMeta<TData, unknown> | undefined;
      return meta?.filter && meta.filter.type !== 'none';
    });

  return (
    <>
      <div className="border-border-subtle bg-background overflow-hidden rounded-xl border shadow-sm">
        {/* Optional header slot */}
        {header && <div>{header}</div>}

        {/* Filter toolbar (built-in, for FE-filtered tables) */}
        {hasFilters && (
          <FilterToolbar columns={columns} filterState={filterState} setFilterState={setFilterState} table={table} />
        )}

        {/* Filter bar (external slot — above scroll area, mobile-friendly) */}
        {filterBar}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className={`w-full table-fixed border-collapse ${minWidth ?? ''}`}>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-background-secondary">
                  {headerGroup.headers.map((hdr) => {
                    const meta = hdr.column.columnDef.meta as ColumnMeta<TData, unknown> | undefined;
                    const align = meta?.align ?? 'start';
                    const widthClass = meta?.widthClass ?? '';
                    return (
                      <th
                        key={hdr.id}
                        className={`bg-background-secondary text-text-muted px-4 py-3 text-xs font-semibold tracking-wider uppercase sm:px-6 sm:py-4 ${widthClass} text-${align}`}
                      >
                        {hdr.isPlaceholder ? null : flexRender(hdr.column.columnDef.header, hdr.getContext())}
                      </th>
                    );
                  })}
                </tr>
              ))}
              {filterRow && <tr className="bg-background-secondary border-border-subtle border-t">{filterRow}</tr>}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-6">
                    {emptyState ?? <EmptyState icon={Inbox} title={t('noResults')} />}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick?.(row.original)}
                    className={`border-border-subtle hover:bg-background-elevated border-t transition-colors duration-200 first:border-t-0 ${onRowClick ? 'cursor-pointer' : ''}`}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta as ColumnMeta<TData, unknown> | undefined;
                      const align = meta?.align ?? 'start';
                      return (
                        <td key={cell.id} className={`px-4 py-3 sm:px-6 sm:py-4 text-${align}`}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer slot (outside card) */}
      {footer}
    </>
  );
};

export default DataTable;
