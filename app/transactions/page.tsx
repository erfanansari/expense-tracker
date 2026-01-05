'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { ExpenseForm } from '@/components/expense-form';
import { Trash2, Edit, Tag, Plus, Loader2, FileText, ArrowUpRight, Search, Filter } from 'lucide-react';
import { type Expense } from '@/lib/types/expense';
import { formatNumber, formatToFarsiDate, getCategoryLabel } from '@/lib/utils';

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
  const [showForm, setShowForm] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

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
          setExpenses(prev => [...prev, ...data.expenses]);
        }

        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore);
      } else {
        setError('Failed to load expenses');
      }
    } catch (err) {
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

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setExpenses(expenses.filter(exp => exp.id !== id));
      } else {
        alert('Failed to delete expense');
      }
    } catch {
      alert('Failed to delete expense');
    } finally {
      setDeletingId(null);
    }
  };

  const handleExpenseChange = () => {
    setExpenses([]);
    setNextCursor(null);
    setHasMore(true);
    fetchExpenses(null, true);
    setEditingExpense(undefined);
    setShowForm(false);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingExpense(undefined);
    setShowForm(false);
  };

  useEffect(() => {
    fetchExpenses(null, true);
  }, [fetchExpenses]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingRef.current) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadMore]);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[var(--background)]">
        {/* Header */}
        <div className="border-b border-[var(--border-subtle)] bg-[var(--background-card)]/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-xl border border-violet-500/20">
                  <FileText className="h-6 w-6 text-violet-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[var(--foreground)]">Transactions</h1>
                  <p className="text-sm text-[var(--foreground-muted)]" dir="rtl">تراکنش‌ها</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  setEditingExpense(undefined);
                }}
                className="group relative px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl text-sm font-semibold text-white transition-all duration-300 flex items-center gap-2 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
              >
                <Plus className="h-4 w-4" />
                <span>Add Transaction</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity" />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Expense Form */}
          {showForm && (
            <div className="mb-6 animate-in slide-in-from-top-4 duration-300">
              <ExpenseForm
                onExpenseAdded={handleExpenseChange}
                editingExpense={editingExpense}
                onCancelEdit={handleCancelEdit}
              />
            </div>
          )}

          {/* Transactions Card */}
          <div className="relative bg-[var(--background-card)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden">
            {/* Card Glow Effect */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

            {isLoading && expenses.length === 0 ? (
              <div className="p-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-500/10 mb-4">
                  <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
                </div>
                <p className="text-[var(--foreground-muted)] font-medium">Loading transactions...</p>
                <p className="text-sm text-[var(--foreground-muted)]/60 mt-1" dir="rtl">در حال بارگذاری تراکنش‌ها...</p>
              </div>
            ) : error && expenses.length === 0 ? (
              <div className="p-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 mb-4">
                  <FileText className="h-8 w-8 text-red-400" />
                </div>
                <p className="text-red-400 font-medium">{error}</p>
              </div>
            ) : expenses.length === 0 ? (
              <div className="p-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--background-elevated)] mb-4">
                  <FileText className="h-8 w-8 text-[var(--foreground-muted)]" />
                </div>
                <p className="text-[var(--foreground-secondary)] font-medium">No transactions yet</p>
                <p className="text-sm text-[var(--foreground-muted)] mt-1">Add your first transaction above!</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-[var(--background-elevated)]/50">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wider w-28">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                      {expenses.map((expense, index) => {
                        const categoryLabels = getCategoryLabel(expense.category);
                        const farsiDate = formatToFarsiDate(expense.date);

                        return (
                          <tr
                            key={expense.id}
                            className="group hover:bg-[var(--background-hover)] transition-colors duration-200"
                            style={{ animationDelay: `${index * 20}ms` }}
                          >
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-[var(--foreground)]">{expense.description}</span>
                                {expense.tags && expense.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5">
                                    {expense.tags.map(tag => (
                                      <div
                                        key={tag.id}
                                        className="flex items-center gap-1 px-2 py-0.5 bg-violet-500/10 text-violet-400 rounded-md text-xs font-medium border border-violet-500/20"
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
                                <span className="text-sm font-medium text-[var(--foreground)]">{categoryLabels.en}</span>
                                <span className="text-xs text-[var(--foreground-muted)]" dir="rtl">
                                  {categoryLabels.fa}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm text-[var(--foreground)]">{expense.date}</span>
                                <span className="text-xs text-[var(--foreground-muted)]" dir="rtl">
                                  {farsiDate}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex flex-col items-end">
                                <span className="text-sm font-semibold text-[var(--foreground)]" dir="rtl">
                                  {formatNumber(expense.price_toman)} تومان
                                </span>
                                <span className="text-xs text-[var(--foreground-muted)]">
                                  ${expense.price_usd.toFixed(2)} USD
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleEdit(expense)}
                                  className="p-2 rounded-lg text-[var(--foreground-muted)] hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-200"
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(expense.id)}
                                  disabled={deletingId === expense.id}
                                  className="p-2 rounded-lg text-[var(--foreground-muted)] hover:text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-all duration-200"
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

                {/* Infinite Loading Indicator */}
                <div
                  ref={observerTarget}
                  className="py-8 flex flex-col items-center justify-center gap-3 border-t border-[var(--border-subtle)]"
                >
                  {isLoadingMore && (
                    <>
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
                        <p className="text-sm text-[var(--foreground-muted)] font-medium">Loading more transactions...</p>
                      </div>
                    </>
                  )}
                  {!hasMore && expenses.length > 0 && (
                    <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
                      <div className="h-px w-12 bg-[var(--border-subtle)]" />
                      <p className="text-sm">End of transactions</p>
                      <div className="h-px w-12 bg-[var(--border-subtle)]" />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

