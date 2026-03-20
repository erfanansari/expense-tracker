'use client';

import { useCallback, useMemo, useState } from 'react';

import { getIncomeTypeLabel, getMonthLabel } from '@constants/income';
import { type ColumnDef } from '@tanstack/react-table';
import { Banknote, DollarSign, FileText, Loader2, Plus, TrendingUp } from 'lucide-react';

import type { Income } from '@types';

import IncomeForm from '@features/income/components/IncomeForm';

import ActionButtons from '@components/ActionButtons';
import Button from '@components/Button';
import DataTable from '@components/DataTable';
import DeleteConfirmModal from '@components/DeleteConfirmModal';
import FormDrawer from '@components/FormDrawer';
import useDrawer from '@components/FormDrawer/useDrawer';
import Pulse from '@components/Skeleton';
import { useToast } from '@components/Toast/ToastProvider';

import { useDeleteConfirmation } from '@hooks/use-delete-confirmation';
import { useDeleteIncome, useIncomes } from '@hooks/use-incomes';

import { ensureError, formatNumber, getJalaliMonthName } from '@utils';

function IncomeSkeleton() {
  return (
    <>
      {/* 4 card skeletons */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border-border-subtle bg-background rounded-xl border p-4 shadow-sm sm:p-5">
            <Pulse className="mb-3 h-9 w-9 rounded-lg sm:mb-4 sm:h-10 sm:w-10" />
            <Pulse className="mb-2 h-3 w-20 sm:mb-3 sm:w-24" />
            <Pulse className="mb-2 h-6 w-3/4 sm:h-8" />
            <Pulse className="h-3 w-1/2 sm:h-4" />
          </div>
        ))}
      </div>

      {/* Year heading + table skeleton */}
      <div className="space-y-6">
        <div>
          <Pulse className="mb-4 h-6 w-12 rounded-md" />
          <div className="border-border-subtle bg-background overflow-hidden rounded-xl border shadow-sm">
            <div className="bg-background-secondary px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex items-center justify-between">
                <Pulse className="h-3 w-16" />
                <Pulse className="hidden h-3 w-14 sm:block" />
                <Pulse className="hidden h-3 w-20 sm:block" />
                <Pulse className="h-3 w-16" />
                <Pulse className="hidden h-3 w-12 sm:block" />
              </div>
            </div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border-border-subtle border-t px-4 py-3 sm:px-6 sm:py-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <Pulse className="h-4 w-20" />
                    <Pulse className="h-3 w-16" />
                  </div>
                  <Pulse className="hidden h-4 w-16 sm:block" />
                  <Pulse className="hidden h-4 w-24 sm:block" />
                  <div className="flex flex-col items-end gap-1">
                    <Pulse className="h-4 w-24" />
                    <Pulse className="h-3 w-20" />
                  </div>
                  <div className="hidden items-center justify-center gap-1 sm:flex">
                    <Pulse className="h-8 w-8 rounded-lg" />
                    <Pulse className="h-8 w-8 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// Income table column factory (per-year, needs edit/delete handlers passed in)
function buildIncomeColumns(
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

const IncomePage = () => {
  // States
  const [editingIncome, setEditingIncome] = useState<Income | undefined>(undefined);

  // Queries
  const { data: incomes = [], isLoading, error } = useIncomes();
  const deleteIncome = useDeleteIncome();

  // Customs
  const { showToast } = useToast();
  const { isOpen: isDrawerOpen, isDirty, openDrawer, closeDrawer, setIsDirty } = useDrawer();
  const {
    itemToDelete: incomeToDelete,
    isModalOpen: isDeleteModalOpen,
    deletingId,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
    confirmDelete,
  } = useDeleteConfirmation<Income>({
    onDelete: (id) => deleteIncome.mutateAsync(id),
    onError: (err) => showToast(ensureError(err).message, 'error'),
  });

  // Callbacks
  const handleIncomeChange = useCallback(() => {
    setEditingIncome(undefined);
    closeDrawer();
  }, [closeDrawer]);

  const handleEdit = useCallback(
    (income: Income) => {
      setEditingIncome(income);
      openDrawer();
    },
    [openDrawer]
  );

  const handleAddIncome = useCallback(() => {
    setEditingIncome(undefined);
    openDrawer();
  }, [openDrawer]);

  // Memos
  const incomeColumns = useMemo(
    () => buildIncomeColumns(handleEdit, openDeleteModal, deletingId),
    [handleEdit, openDeleteModal, deletingId]
  );

  // Variables
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const ytdIncome = incomes.filter((inc) => inc.year === currentYear).reduce((sum, inc) => sum + inc.amountUsd, 0);

  const lastMonthIncome = incomes
    .filter((inc) => inc.year === lastMonthYear && inc.month === lastMonth)
    .reduce((sum, inc) => sum + inc.amountUsd, 0);

  const totalIncomeAllTime = incomes.reduce((sum, inc) => sum + inc.amountUsd, 0);
  const totalIncomeAllTimeToman = incomes.reduce((sum, inc) => sum + inc.amountToman, 0);

  const distinctMonths = new Set(incomes.map((inc) => `${inc.year}-${inc.month}`)).size;
  const avgMonthlyIncome = distinctMonths > 0 ? totalIncomeAllTime / distinctMonths : 0;

  const incomesByYear = incomes.reduce(
    (acc, income) => {
      if (!acc[income.year]) {
        acc[income.year] = [];
      }
      acc[income.year].push(income);
      return acc;
    },
    {} as Record<number, Income[]>
  );

  const sortedYears = Object.keys(incomesByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1600px] px-6 py-8">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between gap-4 sm:mb-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-text-primary text-xl font-bold sm:text-2xl md:text-3xl">Income</h1>
            <p className="text-text-muted mt-1 text-xs sm:text-sm">Track your monthly earnings</p>
          </div>
          <Button variant="primary" onClick={handleAddIncome} className="shrink-0">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Income</span>
          </Button>
        </div>

        {isLoading && incomes.length === 0 ? (
          <IncomeSkeleton />
        ) : (
          <>
            {/* Summary Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
              {/* Total Income (All Time) */}
              <div className="border-border-subtle bg-background relative min-w-0 rounded-xl border p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="border-success/20 bg-success-light rounded-lg border p-2.5">
                    <Banknote className="text-success h-5 w-5" />
                  </div>
                </div>
                <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">Total Income</p>
                <p className="text-success text-2xl font-semibold tabular-nums">${formatNumber(totalIncomeAllTime)}</p>
                <p className="text-text-secondary mt-1.5 text-sm font-medium">
                  {formatNumber(totalIncomeAllTimeToman)} Toman
                </p>
              </div>

              {/* YTD Income */}
              <div className="border-border-subtle bg-background relative min-w-0 rounded-xl border p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
                    <TrendingUp className="text-blue h-5 w-5" />
                  </div>
                </div>
                <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">YTD Income</p>
                <p className="text-text-primary text-2xl font-semibold tabular-nums">${formatNumber(ytdIncome)}</p>
                <p className="text-text-secondary mt-1.5 text-sm font-medium">{currentYear}</p>
              </div>

              {/* Last Month */}
              <div className="border-border-subtle bg-background relative min-w-0 rounded-xl border p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
                    <DollarSign className="text-text-secondary h-5 w-5" />
                  </div>
                </div>
                <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">Last Month</p>
                <p className="text-text-primary text-2xl font-semibold tabular-nums">
                  ${formatNumber(lastMonthIncome)}
                </p>
                <p className="text-text-secondary mt-1.5 text-sm font-medium">
                  {getMonthLabel(lastMonth).en} {lastMonthYear}
                </p>
              </div>

              {/* Monthly Average */}
              <div className="border-border-subtle bg-background relative min-w-0 rounded-xl border p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
                    <TrendingUp className="text-text-secondary h-5 w-5" />
                  </div>
                </div>
                <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">Monthly Average</p>
                <p className="text-text-primary text-2xl font-semibold tabular-nums">
                  ${formatNumber(Math.round(avgMonthlyIncome))}
                </p>
                <p className="text-text-secondary mt-1.5 text-sm font-medium">
                  over {distinctMonths} month{distinctMonths !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Income List */}
            {(() => {
              if (error && incomes.length === 0) {
                return (
                  <div className="border-border-subtle bg-background relative rounded-xl border p-16 text-center shadow-sm">
                    <div className="border-danger bg-danger-light mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl border">
                      <FileText className="text-danger h-8 w-8" />
                    </div>
                    <p className="text-danger font-medium">{error.message}</p>
                  </div>
                );
              }
              if (incomes.length === 0) {
                return (
                  <div className="border-border-subtle bg-background relative rounded-xl border p-16 text-center shadow-sm">
                    <div className="border-border-subtle bg-background-secondary mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl border">
                      <DollarSign className="text-text-muted h-8 w-8" />
                    </div>
                    <p className="text-text-secondary font-medium">No income recorded yet</p>
                    <p className="text-text-muted mt-1 text-sm">Add your first income entry above!</p>
                  </div>
                );
              }
              return (
                <div className="space-y-6">
                  {sortedYears.map((year) => (
                    <div key={year}>
                      <h2 className="text-text-primary mb-4 text-lg font-semibold">{year}</h2>
                      <DataTable
                        data={[...incomesByYear[year]].sort((a, b) => b.month - a.month)}
                        columns={incomeColumns}
                        minWidth="min-w-[480px]"
                        getRowId={(row) => String(row.id)}
                      />
                    </div>
                  ))}
                </div>
              );
            })()}
          </>
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          title="Delete income"
          message="Are you sure you want to delete this income entry?"
          itemName={
            incomeToDelete
              ? `${getMonthLabel(incomeToDelete.month).en} (${getJalaliMonthName(incomeToDelete.month, incomeToDelete.year)}) ${incomeToDelete.year} - ${getIncomeTypeLabel(incomeToDelete.incomeType).en}`
              : undefined
          }
          onConfirm={confirmDelete}
          onCancel={closeDeleteModal}
          isDeleting={deletingId === incomeToDelete?.id}
        />
      </div>

      {/* Income Form Drawer */}
      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        title={editingIncome ? 'Edit Income' : 'Add New Income'}
        isDirty={isDirty}
      >
        <IncomeForm
          onIncomeAdded={handleIncomeChange}
          editingIncome={editingIncome}
          onCancelEdit={closeDrawer}
          setIsDirty={setIsDirty}
        />
      </FormDrawer>
    </div>
  );
};

export default IncomePage;
