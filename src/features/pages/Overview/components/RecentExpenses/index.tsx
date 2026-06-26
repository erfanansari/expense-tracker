import { useMemo } from 'react';

import Link from 'next/link';

import { type ColumnDef } from '@tanstack/react-table';
import { ArrowRight, Receipt, Tag } from 'lucide-react';

import type { Expense } from '@types';

import DataTable from '@components/DataTable';
import EmptyState from '@components/EmptyState';
import Money from '@components/Money';

// ─── Table layout config ──────────────────────────────────────────────────────
// Centralized so column widths can be tuned in one place. Percentages must sum
// to 100; `RECENT_EXPENSES_TABLE_MIN_WIDTH` is the smallest width before the
// table starts scrolling horizontally on narrow viewports.

export const RECENT_EXPENSES_TABLE_MIN_WIDTH = 'min-w-[480px]';

export const RECENT_EXPENSES_COLUMN_WIDTHS = {
  description: 'w-[60%]',
  amount: 'w-[40%]',
} as const;

// ─── Columns ──────────────────────────────────────────────────────────────────

const overviewColumns: ColumnDef<Expense, unknown>[] = [
  {
    id: 'description',
    accessorKey: 'description',
    header: 'Description',
    meta: { widthClass: RECENT_EXPENSES_COLUMN_WIDTHS.description },
    cell: ({ row }) => {
      const expense = row.original;
      return (
        <div className="flex min-w-0 flex-col gap-2">
          <span className="text-text-primary truncate text-sm font-medium">{expense.description}</span>
          {expense.tags && expense.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {expense.tags.map((tag) => (
                <div
                  key={tag.id}
                  className="border-border-subtle bg-background-elevated text-text-secondary flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium"
                >
                  <Tag className="h-3 w-3" aria-hidden="true" />
                  <span>{tag.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: 'Amount',
    meta: { widthClass: RECENT_EXPENSES_COLUMN_WIDTHS.amount, align: 'right' },
    cell: ({ row }) => {
      const expense = row.original;
      return (
        <Money
          amount={expense.amount}
          currency={expense.currency}
          date={expense.date}
          className="items-end"
          primaryClassName="text-text-primary text-sm font-semibold whitespace-nowrap"
          secondaryClassName="text-text-muted text-xs whitespace-nowrap"
        />
      );
    },
  },
];

interface RecentExpensesProps {
  expenses: Expense[];
}

const RecentExpenses = ({ expenses }: RecentExpensesProps) => {
  // Memos
  const recentExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => {
        if (a.date !== b.date) return new Date(b.date).getTime() - new Date(a.date).getTime();
        return b.id - a.id;
      })
      .slice(0, 7);
  }, [expenses]);

  return (
    <DataTable
      data={recentExpenses}
      columns={overviewColumns}
      minimal={true}
      minWidth={RECENT_EXPENSES_TABLE_MIN_WIDTH}
      header={
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-text-primary text-lg font-semibold">Recent Expenses</h2>
          <Link href="/expenses" className="text-blue flex items-center gap-1 text-sm font-medium hover:underline">
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      }
      emptyState={
        <EmptyState icon={Receipt} title="No expenses yet" description="Your most recent expenses will appear here." />
      }
    />
  );
};

export default RecentExpenses;
