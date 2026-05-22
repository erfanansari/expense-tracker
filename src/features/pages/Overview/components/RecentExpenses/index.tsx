import { useMemo } from 'react';

import Link from 'next/link';

import { type ColumnDef } from '@tanstack/react-table';
import { ArrowRight, Receipt, Tag } from 'lucide-react';

import type { Expense } from '@types';

import DataTable from '@components/DataTable';
import EmptyState from '@components/EmptyState';

import { formatNumber } from '@utils';

const overviewColumns: ColumnDef<Expense, unknown>[] = [
  {
    id: 'description',
    accessorKey: 'description',
    header: 'Description',
    meta: { widthClass: 'w-[60%]' },
    cell: ({ row }) => {
      const expense = row.original;
      return (
        <div className="flex flex-col gap-2">
          <span className="text-text-primary text-sm font-medium">{expense.description}</span>
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
    accessorKey: 'price_toman',
    header: 'Amount',
    meta: { widthClass: 'w-[40%]', align: 'right' },
    cell: ({ row }) => {
      const expense = row.original;
      return (
        <div className="flex flex-col items-end">
          <span className="text-text-primary text-sm font-semibold">{formatNumber(expense.price_toman)} Toman</span>
          <span className="text-text-muted text-xs">${expense.price_usd.toFixed(2)} USD</span>
        </div>
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
      minWidth="min-w-[480px]"
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
