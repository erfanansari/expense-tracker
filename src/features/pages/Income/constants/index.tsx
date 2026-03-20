import { getIncomeTypeLabel, getMonthLabel } from '@constants/income';
import { type ColumnDef } from '@tanstack/react-table';

import type { Income } from '@types';

import ActionButtons from '@components/ActionButtons';

import { formatNumber, getJalaliMonthName } from '@utils';

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
      meta: { widthClass: 'w-[22%]' },
      cell: ({ row }) => {
        const income = row.original;
        const monthLabels = getMonthLabel(income.month);
        const jalaliMonth = getJalaliMonthName(income.month, income.year);
        return (
          <div className="flex flex-col">
            <span className="text-text-primary text-sm font-medium">{monthLabels.en}</span>
            <span className="text-text-muted text-xs" dir="rtl">
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
      meta: { widthClass: 'w-[18%]' },
      cell: ({ row }) => {
        const typeLabels = getIncomeTypeLabel(row.original.incomeType);
        return <span className="text-text-primary text-sm font-medium">{typeLabels.en}</span>;
      },
    },
    {
      id: 'source',
      accessorKey: 'source',
      header: 'Source',
      meta: { widthClass: 'w-[25%]' },
      cell: ({ row }) => <span className="text-text-secondary text-sm">{row.original.source || '-'}</span>,
    },
    {
      id: 'amount',
      accessorKey: 'amountUsd',
      header: 'Amount',
      meta: { widthClass: 'w-[23%]', align: 'right' as const },
      cell: ({ row }) => {
        const income = row.original;
        return (
          <div className="flex flex-col items-end">
            <span className="text-success text-sm font-semibold">${formatNumber(income.amountUsd)} USD</span>
            <span className="text-text-muted text-xs">{formatNumber(income.amountToman)} Toman</span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      meta: { widthClass: 'w-[12%]', align: 'center' as const },
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
