'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Loading from '@components/Loading';
import { Trash2, Edit, Tag, Plus, Loader2, FileText } from 'lucide-react';
import { type Expense } from '@types';
import { formatNumber, formatToFarsiDate, getCategoryLabel } from '@/utils';
import ExpenseForm from '@features/expenses/components/ExpenseForm';

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

  return (
    <div className="min-h-screen bg-[#ffffff]">
        <div className="max-w-[1600px] mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#171717]">Transactions</h1>
              <p className="text-xs sm:text-sm text-[#a3a3a3] mt-1">Manage and track all your expenses</p>
            </div>
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditingExpense(undefined);
              }}
              className="px-3 sm:px-5 py-2.5 bg-[#000000] hover:bg-[#171717] rounded-lg text-sm font-semibold text-white transition-all duration-200 flex items-center gap-2 shadow-sm flex-shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Transaction</span>
            </button>
          </div>

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
          {isLoading && expenses.length === 0 ? (
            <Loading message="Loading transactions..." />
          ) : error && expenses.length === 0 ? (
            <div className="relative bg-white rounded-xl border border-[#e5e5e5] shadow-sm p-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-[#fef2f2] mb-4 border border-[#ef4444]">
                <FileText className="h-8 w-8 text-[#ef4444]" />
              </div>
              <p className="text-[#ef4444] font-medium">{error}</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="relative bg-white rounded-xl border border-[#e5e5e5] shadow-sm p-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-[#fafafa] mb-4 border border-[#e5e5e5]">
                <FileText className="h-8 w-8 text-[#a3a3a3]" />
              </div>
              <p className="text-[#525252] font-medium">No transactions yet</p>
              <p className="text-sm text-[#a3a3a3] mt-1">Add your first transaction above!</p>
            </div>
          ) : (
            <>
              <div className="relative bg-white rounded-xl border border-[#e5e5e5] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                      <tr className="bg-[#fafafa]">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider w-28">
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
                            className="group hover:bg-[#f5f5f5] transition-colors duration-200 border-t border-[#e5e5e5] first:border-t-0"
                            style={{ animationDelay: `${index * 20}ms` }}
                          >
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-[#171717]">{expense.description}</span>
                                {expense.tags && expense.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5">
                                    {expense.tags.map(tag => (
                                      <div
                                        key={tag.id}
                                        className="flex items-center gap-1 px-2 py-0.5 bg-[#f5f5f5] text-[#525252] rounded-md text-xs font-medium border border-[#e5e5e5]"
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
                                <span className="text-sm font-medium text-[#171717]">{categoryLabels.en}</span>
                                <span className="text-xs text-[#a3a3a3]" dir="rtl">
                                  {categoryLabels.fa}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm text-[#171717]">{expense.date}</span>
                                <span className="text-xs text-[#a3a3a3]" dir="rtl">
                                  {farsiDate}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex flex-col items-end">
                                <span className="text-sm font-semibold text-[#171717]" dir="rtl">
                                  {formatNumber(expense.price_toman)} تومان
                                </span>
                                <span className="text-xs text-[#a3a3a3]">
                                  ${expense.price_usd.toFixed(2)} USD
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleEdit(expense)}
                                  className="p-2 rounded-lg text-[#a3a3a3] hover:text-[#0070f3] hover:bg-[#0070f3]/10 transition-all duration-200"
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(expense.id)}
                                  disabled={deletingId === expense.id}
                                  className="p-2 rounded-lg text-[#a3a3a3] hover:text-[#ef4444] hover:bg-[#ef4444]/10 disabled:opacity-50 transition-all duration-200"
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
                  <button
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    className="w-full cursor-pointer py-3 bg-white hover:bg-[#fafafa] border border-[#e5e5e5] rounded-lg text-sm font-medium text-[#525252] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </button>
                </div>
              )}

              {!hasMore && expenses.length > 0 && (
                <div className="mt-6 py-4 flex items-center justify-center gap-2 text-[#a3a3a3]">
                  <div className="h-px w-12 bg-[#e5e5e5]" />
                  <p className="text-sm">End of transactions</p>
                  <div className="h-px w-12 bg-[#e5e5e5]" />
                </div>
              )}
            </>
          )}
        </div>
      </div>
  );
}


