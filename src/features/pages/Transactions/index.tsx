'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { EXPENSE_CATEGORIES } from '@constants/categories';
import { type ColumnDef } from '@tanstack/react-table';
import { FileText, Loader2, Plus, Tag, X } from 'lucide-react';

import { type Expense } from '@types';

import ExpenseForm from '@features/expenses/components/ExpenseForm';
import TransactionDetailsDrawer from '@features/expenses/components/TransactionDetailsDrawer';

import ActionButtons from '@components/ActionButtons';
import Button from '@components/Button';
import DataTable from '@components/DataTable';
import DatePicker from '@components/DatePicker';
import DeleteConfirmModal from '@components/DeleteConfirmModal';
import FormDrawer from '@components/FormDrawer';
import useDrawer from '@components/FormDrawer/useDrawer';
import Select from '@components/Select';
import Pulse from '@components/Skeleton';
import { useToast } from '@components/Toast/ToastProvider';

import { useDeleteConfirmation } from '@hooks/use-delete-confirmation';
import { useDeleteExpense, useInfiniteExpenses } from '@hooks/use-expenses';

import { ensureError, formatNumber, formatToFarsiDate, getCategoryLabel } from '@utils';

import { type ExpenseFilters } from '@/lib/api/expenses';

function TransactionsSkeleton() {
  return (
    <div className="border-border-subtle bg-background overflow-hidden rounded-xl border shadow-sm">
      <div className="bg-background-secondary px-4 py-3.5 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <Pulse className="h-3 w-24" />
          <Pulse className="hidden h-3 w-20 sm:block" />
          <Pulse className="hidden h-3 w-16 sm:block" />
          <Pulse className="h-3 w-16" />
          <Pulse className="hidden h-3 w-14 sm:block" />
        </div>
      </div>
      {[...Array(8)].map((_, i) => (
        <div key={i} className="border-border-subtle border-t px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Pulse className="h-4 w-40" />
              <Pulse className="h-3 w-24" />
            </div>
            <div className="hidden flex-col gap-1 sm:flex">
              <Pulse className="h-4 w-20" />
              <Pulse className="h-3 w-16" />
            </div>
            <div className="hidden flex-col gap-1 sm:flex">
              <Pulse className="h-4 w-24" />
              <Pulse className="h-3 w-14" />
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <Pulse className="h-4 w-24" />
              <Pulse className="h-3 w-16" />
            </div>
            <div className="hidden items-center justify-center gap-1 sm:flex">
              <Pulse className="h-8 w-8 rounded-lg" />
              <Pulse className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function buildTransactionColumns(
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

export default function TransactionsPage() {
  const [filters, setFilters] = useState<ExpenseFilters>({});
  // Local input value for description — debounced before sending to BE
  const [descInput, setDescInput] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((f) => ({ ...f, description: descInput || undefined }));
    }, 300);
    return () => clearTimeout(timer);
  }, [descInput]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } = useInfiniteExpenses(filters);
  const deleteExpense = useDeleteExpense();
  const { showToast } = useToast();

  const expenses: Expense[] = data?.pages.flatMap((p) => p.expenses) ?? [];

  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isOpen: isDrawerOpen, isDirty, openDrawer, closeDrawer, setIsDirty } = useDrawer();

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

  const handleRowClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedExpense(null);
  };

  const handleExpenseChange = useCallback(() => {
    // Invalidation is handled automatically by useCreateExpense/useUpdateExpense
    setEditingExpense(undefined);
    closeDrawer();
  }, [closeDrawer]);

  const handleEdit = useCallback(
    (expense: Expense) => {
      setEditingExpense(expense);
      openDrawer();
    },
    [openDrawer]
  );

  const handleAddExpense = useCallback(() => {
    setEditingExpense(undefined);
    openDrawer();
  }, [openDrawer]);

  const transactionColumns = useMemo(
    () => buildTransactionColumns(handleEdit, openDeleteModal, deletingId),
    [handleEdit, openDeleteModal, deletingId]
  );

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1600px] px-6 py-8">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between gap-4 sm:mb-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-text-primary text-xl font-bold sm:text-2xl md:text-3xl">Transactions</h1>
            <p className="text-text-muted mt-1 text-xs sm:text-sm">Manage and track all your expenses</p>
          </div>
          <Button variant="primary" onClick={handleAddExpense} className="shrink-0">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Transaction</span>
          </Button>
        </div>

        {/* Transactions Card */}
        {(() => {
          const hasActiveFilter = !!(filters.description || filters.category || filters.dateFrom || filters.dateTo);

          if (isLoading && expenses.length === 0) {
            return <TransactionsSkeleton />;
          }
          if (error && expenses.length === 0) {
            return (
              <div className="border-border-subtle bg-background relative rounded-xl border p-16 text-center shadow-sm">
                <div className="border-danger bg-danger-light mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl border">
                  <FileText className="text-danger h-8 w-8" />
                </div>
                <p className="text-danger font-medium">{error.message}</p>
              </div>
            );
          }
          return (
            <DataTable
              data={expenses}
              columns={transactionColumns}
              onRowClick={handleRowClick}
              getRowId={(row) => String(row.id)}
              minimal={true}
              minWidth="min-w-[560px]"
              filterBar={
                <div className="border-border-subtle flex flex-wrap items-center gap-2 border-b px-4 py-3">
                  {/* Description */}
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={descInput}
                    onChange={(e) => setDescInput(e.target.value)}
                    className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue min-w-[140px] flex-[2] rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none"
                  />
                  {/* Category */}
                  <Select
                    value={filters.category ?? ''}
                    onChange={(val) => setFilters((f) => ({ ...f, category: val || undefined }))}
                    options={[
                      { value: '', label: 'All categories' },
                      ...EXPENSE_CATEGORIES.map((c) => ({ value: c.value, label: c.label })),
                    ]}
                    placeholder="All categories"
                    className="min-w-[130px] flex-1"
                  />
                  {/* Date range */}
                  <div className="flex min-w-[200px] flex-1 flex-wrap items-center gap-1.5">
                    <DatePicker
                      value={filters.dateFrom ?? ''}
                      onChange={(date) => setFilters((f) => ({ ...f, dateFrom: date || undefined }))}
                      placeholder="From"
                      isClearable
                      wrapperClassName="min-w-[90px] flex-1"
                    />
                    <span className="text-text-muted shrink-0 text-xs">–</span>
                    <DatePicker
                      value={filters.dateTo ?? ''}
                      onChange={(date) => setFilters((f) => ({ ...f, dateTo: date || undefined }))}
                      placeholder="To"
                      isClearable
                      wrapperClassName="min-w-[90px] flex-1"
                    />
                  </div>
                  {/* Clear all */}
                  {hasActiveFilter && (
                    <button
                      onClick={() => {
                        setFilters({});
                        setDescInput('');
                      }}
                      className="text-text-muted hover:text-text-primary flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs transition-colors"
                      title="Clear filters"
                    >
                      <X className="h-3.5 w-3.5" />
                      Clear
                    </button>
                  )}
                </div>
              }
              emptyState={
                <div className="flex flex-col items-center gap-2">
                  {isLoading && <Loader2 className="text-text-muted h-6 w-6 animate-spin" />}
                  {!isLoading && hasActiveFilter && (
                    <>
                      <p className="text-text-secondary font-medium">No transactions found</p>
                      <p className="text-text-muted text-sm">Try adjusting your filters</p>
                    </>
                  )}
                  {!isLoading && !hasActiveFilter && (
                    <>
                      <FileText className="text-text-muted h-8 w-8" />
                      <p className="text-text-secondary font-medium">No transactions yet</p>
                      <p className="text-text-muted text-sm">Add your first transaction above!</p>
                    </>
                  )}
                </div>
              }
              footer={
                <>
                  {hasNextPage && (
                    <div className="mt-4">
                      <Button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        variant="outline"
                        className="w-full"
                      >
                        {isFetchingNextPage ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          'Load More'
                        )}
                      </Button>
                    </div>
                  )}
                  {!hasNextPage && expenses.length > 0 && (
                    <div className="text-text-muted mt-6 flex items-center justify-center gap-2 py-4">
                      <div className="bg-border-subtle h-px w-12" />
                      <p className="text-sm">End of transactions</p>
                      <div className="bg-border-subtle h-px w-12" />
                    </div>
                  )}
                </>
              }
            />
          );
        })()}

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

      {/* Expense Form Drawer */}
      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        title={editingExpense ? 'Edit Expense' : 'Add New Expense'}
        isDirty={isDirty}
      >
        <ExpenseForm
          onExpenseAdded={handleExpenseChange}
          editingExpense={editingExpense}
          onCancelEdit={closeDrawer}
          setIsDirty={setIsDirty}
        />
      </FormDrawer>
    </div>
  );
}
