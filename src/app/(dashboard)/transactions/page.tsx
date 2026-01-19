'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Edit2, FileText, Loader2, Plus, Tag, Trash2 } from 'lucide-react';

import { type Expense } from '@types';

import ExpenseForm from '@features/expenses/components/ExpenseForm';
import TransactionDetailsModal from '@features/expenses/components/TransactionDetailsModal';

import Button from '@components/Button';
import DeleteConfirmModal from '@components/DeleteConfirmModal';
import FormDrawer from '@components/FormDrawer';
import useDrawer from '@components/FormDrawer/useDrawer';
import Loading from '@components/Loading';

import { formatNumber, formatToFarsiDate, getCategoryLabel } from '@/utils';

const ITEMS_PER_PAGE = 20;

export default function TransactionsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const isLoadingRef = useRef(false);
  const { isOpen: isDrawerOpen, isDirty, openDrawer, closeDrawer, setIsDirty } = useDrawer();

  const handleRowClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedExpense(null);
  };

  const fetchExpenses = useCallback(async (cursor: string | null = null, isInitial = false) => {
    if (isLoadingRef.current) {
      return;
    }

    if (isInitial) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);
    isLoadingRef.current = true;

    try {
      const url = cursor
        ? `/api/expenses?limit=${ITEMS_PER_PAGE}&cursor=${encodeURIComponent(cursor)}`
        : `/api/expenses?limit=${ITEMS_PER_PAGE}`;

      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();

        if (isInitial) {
          setExpenses(data.expenses);
        } else {
          setExpenses((prev) => [...prev, ...data.expenses]);
        }

        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore);
      } else {
        setError('Failed to load expenses');
      }
    } catch (_err) {
      setError('Failed to load expenses');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!isLoadingRef.current && hasMore && nextCursor) {
      fetchExpenses(nextCursor, false);
    }
  }, [hasMore, nextCursor, fetchExpenses]);

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
      const response = await fetch(`/api/expenses/${expenseToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setExpenses(expenses.filter((exp) => exp.id !== expenseToDelete.id));
        closeDeleteModal();
      } else {
        alert('Failed to delete expense');
      }
    } catch {
      alert('Failed to delete expense');
    } finally {
      setDeletingId(null);
    }
  };

  const handleExpenseChange = useCallback(() => {
    setExpenses([]);
    setNextCursor(null);
    setHasMore(true);
    fetchExpenses(null, true);
    setEditingExpense(undefined);
    closeDrawer();
  }, [fetchExpenses, closeDrawer]);

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

  useEffect(() => {
    fetchExpenses(null, true);
  }, [fetchExpenses]);

  return (
    <div className="bg-background min-h-screen">
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
            return <Loading message="Loading transactions..." />;
          }
          if (error && expenses.length === 0) {
            return (
              <div className="border-border-subtle bg-background relative rounded-xl border p-16 text-center shadow-sm">
                <div className="border-danger bg-danger-light mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl border">
                  <FileText className="text-danger h-8 w-8" />
                </div>
                <p className="text-danger font-medium">{error}</p>
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
              <div className="border-border-subtle bg-background relative overflow-hidden rounded-xl border shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                      <tr className="bg-background-secondary">
                        <th className="text-text-muted px-6 py-4 text-left text-xs font-semibold tracking-wider uppercase">
                          Description
                        </th>
                        <th className="text-text-muted px-6 py-4 text-left text-xs font-semibold tracking-wider uppercase">
                          Category
                        </th>
                        <th className="text-text-muted px-6 py-4 text-left text-xs font-semibold tracking-wider uppercase">
                          Date
                        </th>
                        <th className="text-text-muted px-6 py-4 text-right text-xs font-semibold tracking-wider uppercase">
                          Amount
                        </th>
                        <th className="text-text-muted w-28 px-6 py-4 text-center text-xs font-semibold tracking-wider uppercase">
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
                              <div className="flex flex-col">
                                <span className="text-text-primary text-sm font-medium">{categoryLabels.en}</span>
                                <span className="text-text-muted text-xs" dir="rtl">
                                  {categoryLabels.fa}
                                </span>
                              </div>
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

              {/* Load More Button - Separate from table */}
              {hasMore && (
                <div className="mt-4">
                  <Button onClick={loadMore} disabled={isLoadingMore} variant="outline" className="w-full">
                    {isLoadingMore ? (
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

              {!hasMore && expenses.length > 0 && (
                <div className="text-text-muted mt-6 flex items-center justify-center gap-2 py-4">
                  <div className="bg-border-subtle h-px w-12" />
                  <p className="text-sm">End of transactions</p>
                  <div className="bg-border-subtle h-px w-12" />
                </div>
              )}
            </>
          );
        })()}

        {/* Transaction Details Modal */}
        <TransactionDetailsModal expense={selectedExpense} isOpen={isModalOpen} onClose={handleCloseModal} />

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
