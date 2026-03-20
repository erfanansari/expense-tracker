'use client';

import { useCallback, useState } from 'react';

import { getIncomeTypeLabel, getMonthLabel } from '@constants/income';
import { Plus } from 'lucide-react';

import type { Income } from '@types';

import IncomeForm from '@features/income/components/IncomeForm';

import Button from '@components/Button';
import DeleteConfirmModal from '@components/DeleteConfirmModal';
import FormDrawer from '@components/FormDrawer';
import useDrawer from '@components/FormDrawer/useDrawer';
import Pulse from '@components/Skeleton';
import { useToast } from '@components/Toast/ToastProvider';

import { useDeleteConfirmation } from '@hooks/use-delete-confirmation';
import { useDeleteIncome, useIncomes } from '@hooks/use-incomes';

import { ensureError, getJalaliMonthName } from '@utils';

import IncomeSummary from './components/IncomeSummary';
import IncomeTable from './components/IncomeTable';

function IncomeSummarySkeleton() {
  return (
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
  );
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

  // Variables
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

        {isLoading && incomes.length === 0 ? <IncomeSummarySkeleton /> : <IncomeSummary incomes={incomes} />}

        <IncomeTable
          incomesByYear={incomesByYear}
          sortedYears={sortedYears}
          isLoading={isLoading && incomes.length === 0}
          error={error}
          onEdit={handleEdit}
          onDelete={openDeleteModal}
          deletingId={deletingId}
        />

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
