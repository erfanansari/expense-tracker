import { type ColumnDef } from '@tanstack/react-table';
import { Tag } from 'lucide-react';

import type { Expense } from '@types';

import ActionButtons from '@components/ActionButtons';

import { formatNumber, formatToFarsiDate, getCategoryLabel } from '@utils';

export function buildTransactionColumns(
  handleEdit: (expense: Expense) => void,
  openDeleteModal: (expense: Expense) => void,
  deletingId: number | null
): ColumnDef<Expense, unknown>[] {
  return [
    {
      id: 'description',
      accessorKey: 'description',
      header: 'Description',
      meta: { widthClass: 'w-[35%]' },
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
      meta: { widthClass: 'w-[18%]' },
      cell: ({ row }) => {
        const categoryLabels = getCategoryLabel(row.original.category);
        return <span className="text-text-primary text-sm font-medium">{categoryLabels.en}</span>;
      },
    },
    {
      id: 'date',
      accessorKey: 'date',
      header: 'Date',
      meta: { widthClass: 'w-[18%]' },
      cell: ({ row }) => {
        const expense = row.original;
        const farsiDate = formatToFarsiDate(expense.date);
        return (
          <div className="flex flex-col">
            <span className="text-text-primary text-sm">{expense.date}</span>
            <span className="text-text-muted text-xs" dir="rtl">
              {farsiDate}
            </span>
          </div>
        );
      },
    },
    {
      id: 'amount',
      accessorKey: 'price_toman',
      header: 'Amount',
      meta: { widthClass: 'w-[19%]', align: 'right' as const },
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
    {
      id: 'actions',
      header: 'Actions',
      meta: { widthClass: 'w-[10%]', align: 'center' as const },
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
