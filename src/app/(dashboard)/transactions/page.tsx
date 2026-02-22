'use client';

import { useCallback, useState } from 'react';

import { Edit2, FileText, Loader2, Plus, Tag, Trash2 } from 'lucide-react';

import { type Expense } from '@types';

import ExpenseForm from '@features/expenses/components/ExpenseForm';
import TransactionDetailsDrawer from '@features/expenses/components/TransactionDetailsDrawer';

import Button from '@components/Button';
import DeleteConfirmModal from '@components/DeleteConfirmModal';
import FormDrawer from '@components/FormDrawer';
import useDrawer from '@components/FormDrawer/useDrawer';

import { useToast } from '@/components/Toast/ToastProvider';
import { useDeleteExpense, useInfiniteExpenses } from '@/hooks/use-expenses';
import { formatNumber, formatToFarsiDate, getCategoryLabel } from '@/utils';

function Pulse({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-sm bg-zinc-300 ${className}`} aria-label="Loading" />;
}

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

export default function TransactionsPage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } = useInfiniteExpenses();
  const deleteExpense = useDeleteExpense();
  const { showToast } = useToast();

  const expenses: Expense[] = data?.pages.flatMap((p) => p.expenses) ?? [];

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { isOpen: isDrawerOpen, isDirty, openDrawer, closeDrawer, setIsDirty } = useDrawer();

  const handleRowClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedExpense(null);
  };

  const openDeleteModal = (expense: Expense) => {
    setExpenseToDelete(expense);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setExpenseToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!expenseToDelete) return;

    setDeletingId(expenseToDelete.id);

    try {
      await deleteExpense.mutateAsync(expenseToDelete.id);
      closeDeleteModal();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete expense', 'error');
    } finally {
      setDeletingId(null);
    }
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
          if (expenses.length === 0) {
            return (
              <div className="border-border-subtle bg-background relative rounded-xl border p-16 text-center shadow-sm">
                <div className="border-border-subtle bg-background-secondary mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl border">
                  <FileText className="text-text-muted h-8 w-8" />
                </div>
                <p className="text-text-secondary font-medium">No transactions yet</p>
                <p className="text-text-muted mt-1 text-sm">Add your first transaction above!</p>
              </div>
            );
          }
          return (
            <>
              <div className="border-border-subtle bg-background relative rounded-xl border shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] border-collapse">
                    <thead>
                      <tr className="bg-background-secondary">
                        <th className="text-text-muted w-[35%] px-6 py-4 text-left text-xs font-semibold tracking-wider uppercase">
                          Description
                        </th>
                        <th className="text-text-muted w-[18%] px-6 py-4 text-left text-xs font-semibold tracking-wider uppercase">
                          Category
                        </th>
                        <th className="text-text-muted w-[18%] px-6 py-4 text-left text-xs font-semibold tracking-wider uppercase">
                          Date
                        </th>
                        <th className="text-text-muted w-[19%] px-6 py-4 text-right text-xs font-semibold tracking-wider uppercase">
                          Amount
                        </th>
                        <th className="text-text-muted w-[10%] px-6 py-4 text-center text-xs font-semibold tracking-wider uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((expense, index) => {
                        const categoryLabels = getCategoryLabel(expense.category);
                        const farsiDate = formatToFarsiDate(expense.date);

                        return (
                          <tr
                            key={expense.id}
                            onClick={() => handleRowClick(expense)}
                            className="group border-border-subtle hover:bg-background-elevated cursor-pointer border-t transition-colors duration-200 first:border-t-0"
                            style={{ animationDelay: `${index * 20}ms` }}
                          >
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-2">
                                <span className="text-text-primary text-sm font-medium">{expense.description}</span>
                                {expense.tags && expense.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5">
                                    {expense.tags.map((tag) => (
                                      <div
                                        key={tag.id}
                                        className="border-border-subtle bg-background-elevated text-text-secondary flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium"
                                      >
                                        <Tag className="h-3 w-3" />
                                        <span>{tag.name}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-text-primary text-sm font-medium">{categoryLabels.en}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-text-primary text-sm">{expense.date}</span>
                                <span className="text-text-muted text-xs" dir="rtl">
                                  {farsiDate}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex flex-col items-end">
                                <span className="text-text-primary text-sm font-semibold" dir="rtl">
                                  {formatNumber(expense.price_toman)} تومان
                                </span>
                                <span className="text-text-muted text-xs">${expense.price_usd.toFixed(2)} USD</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(expense);
                                  }}
                                  className="text-text-muted hover:bg-blue/10 hover:text-blue rounded-lg p-2 transition-all duration-200"
                                  title="Edit"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDeleteModal(expense);
                                  }}
                                  disabled={deletingId === expense.id}
                                  className="text-text-muted hover:bg-danger/10 hover:text-danger rounded-lg p-2 transition-all duration-200 disabled:opacity-50"
                                  title="Delete"
                                >
                                  {deletingId === expense.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Load More Button */}
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
        titleFa={editingExpense ? 'ویرایش هزینه' : 'افزودن هزینه جدید'}
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
