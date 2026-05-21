'use client';

import { useEffect, useState } from 'react';

import { Plus } from 'lucide-react';

import { type Expense } from '@types';

import { useGlobalDrawer } from '@features/drawers/GlobalDrawerProvider';
import TransactionDetailsDrawer from '@features/expenses/components/TransactionDetailsDrawer';

import Button from '@components/Button';
import DeleteConfirmModal from '@components/DeleteConfirmModal';
import { useToast } from '@components/Toast/ToastProvider';

import { useDeleteConfirmation } from '@hooks/use-delete-confirmation';
import { useDeleteExpense, useInfiniteExpenses } from '@hooks/use-expenses';

import { ensureError } from '@utils';

import { type ExpenseFilters } from '@/lib/api/expenses';

import TransactionsTable from './components/TransactionsTable';

const TransactionsPage = () => {
  // States
  const [filters, setFilters] = useState<ExpenseFilters>({});
  const [descInput, setDescInput] = useState('');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Queries
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } = useInfiniteExpenses(filters);
  const deleteExpense = useDeleteExpense();

  // Customs
  const { showToast } = useToast();
  const { openExpenseDrawer } = useGlobalDrawer();
  const {
    itemToDelete: expenseToDelete,
    isModalOpen: isDeleteModalOpen,
    deletingId,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
    confirmDelete,
  } = useDeleteConfirmation<Expense>({
    onDelete: (id) => deleteExpense.mutateAsync(id),
    onError: (err) => showToast(ensureError(err).message, 'error'),
  });

  // Variables
  const expenses: Expense[] = data?.pages.flatMap((p) => p.expenses) ?? [];

  // Effects
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((f) => ({ ...f, description: descInput || undefined }));
    }, 300);
    return () => clearTimeout(timer);
  }, [descInput]);

  // Callbacks
  const handleRowClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedExpense(null);
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1600px] px-6 py-8">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between gap-4 sm:mb-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-text-primary text-xl font-semibold sm:text-2xl md:text-3xl">Transactions</h1>
            <p className="text-text-muted mt-1 text-xs sm:text-sm">Manage and track all your expenses</p>
          </div>
          <Button variant="primary" onClick={() => openExpenseDrawer()} className="shrink-0">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Transaction</span>
          </Button>
        </div>

        {/* Transactions Table */}
        <TransactionsTable
          expenses={expenses}
          isLoading={isLoading}
          error={error}
          filters={filters}
          descInput={descInput}
          onDescInputChange={setDescInput}
          onFiltersChange={setFilters}
          onRowClick={handleRowClick}
          onEdit={openExpenseDrawer}
          onDelete={openDeleteModal}
          deletingId={deletingId}
          hasNextPage={hasNextPage ?? false}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={() => fetchNextPage()}
        />

        {/* Transaction Details Drawer */}
        <TransactionDetailsDrawer expense={selectedExpense} isOpen={isModalOpen} onClose={handleCloseModal} />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          title="Delete expense"
          message="Are you sure you want to delete this expense? All associated data will be removed."
          itemName={expenseToDelete?.description}
          onConfirm={confirmDelete}
          onCancel={closeDeleteModal}
          isDeleting={deletingId === expenseToDelete?.id}
        />
      </div>
    </div>
  );
};

export default TransactionsPage;
