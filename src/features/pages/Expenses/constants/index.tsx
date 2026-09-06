import type { useTranslations } from 'next-intl';

import { type ColumnDef } from '@tanstack/react-table';
import { Landmark, Repeat, Tag } from 'lucide-react';

import type { Expense } from '@types';

import ActionButtons from '@components/ActionButtons';
import CategoryBadge from '@components/CategoryBadge';
import Money from '@components/Money';

import { useAppDate } from '@hooks/use-app-date';

// The primary/secondary calendar pair depends on locale + calendar preference,
// so this needs its own component to call the hook (react-table cells are plain
// render functions, not stable components).
function ExpenseDateCell({ date }: { date: string }) {
  const appDate = useAppDate();
  const { primary, secondary } = appDate(date);
  return (
    <div className="flex flex-col">
      <span className="text-text-primary text-sm whitespace-nowrap">{primary}</span>
      {secondary && (
        <span className="text-text-muted text-xs whitespace-nowrap" dir="auto">
          {secondary}
        </span>
      )}
    </div>
  );
}

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
  t: ReturnType<typeof useTranslations<'tables'>>,
  handleEdit: (expense: Expense) => void,
  openDeleteModal: (expense: Expense) => void,
  deletingId: number | null
): ColumnDef<Expense, unknown>[] {
  return [
    {
      id: 'description',
      accessorKey: 'description',
      header: t('expenses.description'),
      meta: { widthClass: EXPENSE_COLUMN_WIDTHS.description },
      cell: ({ row }) => {
        const expense = row.original;
        return (
          <div className="flex min-w-0 flex-col gap-2">
            <span className="flex min-w-0 items-center gap-1.5">
              <span className="text-text-primary truncate text-sm font-medium">{expense.description}</span>
              {/* Marks a row the user didn't type — posted by a recurring rule.
                  Icon-only with a tooltip so it never crowds the description. */}
              {expense.recurringId !== null && (
                <span className="inline-flex shrink-0" title={t('expenses.generated')}>
                  <Repeat className="text-text-muted h-3.5 w-3.5" aria-label={t('expenses.generated')} />
                </span>
              )}
              {/* Which account paid, as a marker rather than a column: it's
                  empty for most rows, and a sixth column would spend ~14% of
                  the table's width on it. The name lives in the tooltip and
                  the details drawer. */}
              {expense.paidFrom && (
                <span className="inline-flex shrink-0" title={expense.paidFrom.name}>
                  <Landmark className="text-text-muted h-3.5 w-3.5" aria-label={expense.paidFrom.name} />
                </span>
              )}
            </span>
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
      header: t('expenses.category'),
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
      header: t('expenses.date'),
      meta: { widthClass: EXPENSE_COLUMN_WIDTHS.date },
      cell: ({ row }) => <ExpenseDateCell date={row.original.date} />,
    },
    {
      id: 'amount',
      accessorKey: 'amount',
      header: t('expenses.amount'),
      meta: { widthClass: EXPENSE_COLUMN_WIDTHS.amount, align: 'end' as const },
      cell: ({ row }) => {
        const expense = row.original;
        return (
          <Money
            amount={expense.amount}
            currency={expense.currency}
            date={expense.date}
            entryRate={expense.entryRate}
            className="items-end"
            primaryClassName="text-text-primary text-sm font-semibold whitespace-nowrap"
            secondaryClassName="text-text-muted text-xs whitespace-nowrap"
          />
        );
      },
    },
    {
      id: 'actions',
      header: t('actions'),
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
