import { type ColumnDef } from '@tanstack/react-table';
import { Tag } from 'lucide-react';

import type { Expense } from '@types';

import ActionButtons from '@components/ActionButtons';
import CategoryBadge from '@components/CategoryBadge';
import Money from '@components/Money';

import { formatToFarsiDate } from '@utils';

// ─── Table layout config ──────────────────────────────────────────────────────
// Centralized so column widths can be tuned in one place. Percentages must sum
// to 100; `EXPENSE_TABLE_MIN_WIDTH` is the smallest width the table is allowed
// to shrink to before triggering horizontal scroll on narrow viewports — bump
// it when a column needs more room.

export const EXPENSE_TABLE_MIN_WIDTH = 'min-w-[820px]';

export const EXPENSE_COLUMN_WIDTHS = {
  description: 'w-[24%]',
  category: 'w-[26%]',
  date: 'w-[16%]',
  amount: 'w-[24%]',
  actions: 'w-[10%]',
} as const;

// ─── Column definitions ───────────────────────────────────────────────────────

export function buildExpenseColumns(
  handleEdit: (expense: Expense) => void,
  openDeleteModal: (expense: Expense) => void,
  deletingId: number | null
): ColumnDef<Expense, unknown>[] {
  return [
    {
      id: 'description',
      accessorKey: 'description',
      header: 'Description',
      meta: { widthClass: EXPENSE_COLUMN_WIDTHS.description },
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
      id: 'category',
      accessorKey: 'category',
      header: 'Category',
      meta: { widthClass: EXPENSE_COLUMN_WIDTHS.category },
      cell: ({ row }) => (
        <div className="flex max-w-full min-w-0">
          <CategoryBadge category={row.original.category} className="max-w-full" />
        </div>
      ),
    },
    {
      id: 'date',
      accessorKey: 'date',
      header: 'Date',
      meta: { widthClass: EXPENSE_COLUMN_WIDTHS.date },
      cell: ({ row }) => {
        const expense = row.original;
        return (
          <div className="flex flex-col">
            <span className="text-text-primary text-sm whitespace-nowrap">{expense.date}</span>
            <span className="text-text-muted text-xs whitespace-nowrap" dir="rtl">
              {formatToFarsiDate(expense.date)}
            </span>
          </div>
        );
      },
    },
    {
      id: 'amount',
      accessorKey: 'amount',
      header: 'Amount',
      meta: { widthClass: EXPENSE_COLUMN_WIDTHS.amount, align: 'right' as const },
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
    {
      id: 'actions',
      header: 'Actions',
      meta: { widthClass: EXPENSE_COLUMN_WIDTHS.actions, align: 'center' as const },
      cell: ({ row }) => {
        const expense = row.original;
        return (
          <ActionButtons
            onEdit={() => handleEdit(expense)}
            onDelete={() => openDeleteModal(expense)}
            isDeleting={deletingId === expense.id}
          />
        );
      },
    },
  ];
}
