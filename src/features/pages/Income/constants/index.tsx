import { getIncomeTypeLabel, getMonthLabel } from '@constants/income';
import { type ColumnDef } from '@tanstack/react-table';

import type { Income } from '@types';

import ActionButtons from '@components/ActionButtons';
import Money from '@components/Money';

import { getJalaliMonthName } from '@utils';

// ─── Table layout config ──────────────────────────────────────────────────────
// Centralized so column widths can be tuned in one place. Percentages must sum
// to 100; `INCOME_TABLE_MIN_WIDTH` is the smallest width the table is allowed
// to shrink to before triggering horizontal scroll on narrow viewports.

export const INCOME_TABLE_MIN_WIDTH = 'min-w-[720px]';

export const INCOME_COLUMN_WIDTHS = {
  month: 'w-[18%]',
  type: 'w-[15%]',
  source: 'w-[24%]',
  amount: 'w-[32%]',
  actions: 'w-[11%]',
} as const;

// ─── Column definitions ───────────────────────────────────────────────────────

export function buildIncomeColumns(
  handleEdit: (income: Income) => void,
  openDeleteModal: (income: Income) => void,
  deletingId: number | null
): ColumnDef<Income, unknown>[] {
  return [
    {
      id: 'month',
      accessorKey: 'month',
      header: 'Month',
      meta: { widthClass: INCOME_COLUMN_WIDTHS.month },
      cell: ({ row }) => {
        const income = row.original;
        const monthLabels = getMonthLabel(income.month);
        const jalaliMonth = getJalaliMonthName(income.month, income.year);
        return (
          <div className="flex flex-col">
            <span className="text-text-primary text-sm font-medium whitespace-nowrap">{monthLabels.en}</span>
            <span className="text-text-muted text-xs whitespace-nowrap" dir="rtl">
              {jalaliMonth}
            </span>
          </div>
        );
      },
    },
    {
      id: 'incomeType',
      accessorKey: 'incomeType',
      header: 'Type',
      meta: { widthClass: INCOME_COLUMN_WIDTHS.type },
      cell: ({ row }) => {
        const typeLabels = getIncomeTypeLabel(row.original.incomeType);
        return <span className="text-text-primary text-sm font-medium whitespace-nowrap">{typeLabels.en}</span>;
      },
    },
    {
      id: 'source',
      accessorKey: 'source',
      header: 'Source',
      meta: { widthClass: INCOME_COLUMN_WIDTHS.source },
      cell: ({ row }) => (
        <span className="text-text-secondary block truncate text-sm">{row.original.source || '-'}</span>
      ),
    },
    {
      id: 'amount',
      accessorKey: 'amount',
      header: 'Amount',
      meta: { widthClass: INCOME_COLUMN_WIDTHS.amount, align: 'right' as const },
      cell: ({ row }) => {
        const income = row.original;
        return (
          <Money
            amount={income.amount}
            currency={income.currency}
            className="items-end"
            primaryClassName="text-success text-sm font-semibold whitespace-nowrap"
            secondaryClassName="text-text-muted text-xs whitespace-nowrap"
          />
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      meta: { widthClass: INCOME_COLUMN_WIDTHS.actions, align: 'center' as const },
      cell: ({ row }) => {
        const income = row.original;
        return (
          <ActionButtons
            onEdit={() => handleEdit(income)}
            onDelete={() => openDeleteModal(income)}
            isDeleting={deletingId === income.id}
          />
        );
      },
    },
  ];
}
