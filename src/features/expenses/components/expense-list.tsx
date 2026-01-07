'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Trash2, FileText, Edit, Tag } from 'lucide-react';
import { type Expense } from '@/@types/expense';
import { formatNumber, formatToFarsiDate, getCategoryLabel } from '@/utils';

interface ExpenseListProps {
  refreshTrigger: number;
  onDelete: () => void;
  onEdit: (expense: Expense) => void;
}

const ITEMS_PER_PAGE = 20;

export function ExpenseList({ refreshTrigger, onDelete, onEdit }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  const fetchExpenses = useCallback(async (cursor: string | null = null, isInitial = false) => {
    // Prevent duplicate requests
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
        onDelete();
      } else {
        alert('Failed to delete expense');
      }
    } catch {
      alert('Failed to delete expense');
    } finally {
      setDeletingId(null);
    }
  };

  // Reset and fetch initial expenses when refreshTrigger changes
  useEffect(() => {
    setExpenses([]);
    setNextCursor(null);
    setHasMore(true);
    fetchExpenses(null, true);
  }, [refreshTrigger, fetchExpenses]);

  // Set up Intersection Observer for infinite scrolling
  // Only trigger when user has scrolled all the way to the bottom (threshold: 1.0)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingRef.current) {
          loadMore();
        }
      },
      { threshold: 1.0 } // Only trigger when the sentinel element is fully visible (user reached the bottom)
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

  if (isLoading) {
    return (
      <div className="w-full p-8 flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
        <p className="text-sm text-zinc-500 font-medium">Loading expenses...</p>
      </div>
    );
  }

  if (error && expenses.length === 0) {
    return (
      <div className="w-full p-8">
        <p className="text-center text-sm text-rose-400 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-br from-[#0f0f18] to-[#0a0a12] rounded-2xl border border-[#1f1f30] p-5 sm:p-6 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-lg border border-cyan-500/30">
          <FileText className="h-4 w-4 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">
            Expense Details
          </h2>
          <p className="text-xs text-zinc-500" dir="rtl">جزئیات هزینه‌ها</p>
        </div>
      </div>

      {error && expenses.length > 0 && (
        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl">
          <p className="text-sm text-rose-400 font-medium">{error}</p>
        </div>
      )}

      {expenses.length === 0 ? (
        <div className="w-full p-8 text-center">
          <p className="text-sm text-zinc-500 font-medium">No expenses yet. Add your first expense above!</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto -mx-5 sm:mx-0">
            <table className="w-full border-collapse">
              <thead className="bg-[#0a0a12]/80">
                <tr>
                  <th className="px-3 py-3 sm:px-4 sm:py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-3 py-3 sm:px-4 sm:py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-3 py-3 sm:px-4 sm:py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-3 py-3 sm:px-4 sm:py-4 text-right text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-3 py-3 sm:px-4 sm:py-4 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wider w-20 sm:w-24">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f30]">
                {expenses.map((expense) => {
                  const categoryLabels = getCategoryLabel(expense.category);
                  const farsiDate = formatToFarsiDate(expense.date);

                  return (
                    <tr
                      key={expense.id}
                      className="hover:bg-[#1a1a28]/50 transition-colors group"
                    >
                      <td className="px-3 py-3 sm:px-4 sm:py-4 text-sm font-medium text-white">
                        <div className="flex flex-col gap-1.5">
                          <span>{expense.description}</span>
                          {expense.tags && expense.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {expense.tags.map(tag => (
                                <div
                                  key={tag.id}
                                  className="flex items-center gap-1 px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-lg text-[10px] font-semibold border border-cyan-500/20"
                                >
                                  <Tag className="h-2.5 w-2.5" />
                                  <span>{tag.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 sm:px-4 sm:py-4 text-sm">
                        <div className="flex flex-col">
                          <span className="text-white font-medium">{categoryLabels.en}</span>
                          <span className="text-zinc-500 text-xs" dir="rtl">
                            {categoryLabels.fa}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 sm:px-4 sm:py-4 text-sm">
                        <div className="flex flex-col">
                          <span className="text-white font-medium">{expense.date}</span>
                          <span className="text-zinc-500 text-xs" dir="rtl">
                            {farsiDate}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 sm:px-4 sm:py-4 text-sm text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-white font-bold tabular-nums" dir="rtl">
                            {formatNumber(expense.price_toman)} تومان
                          </span>
                          <span className="relative group/amount text-zinc-500 text-xs cursor-help inline-block">
                            ${expense.price_usd.toFixed(2)} USD
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[calc(100%+0.5rem)] hidden group-hover/amount:inline-block whitespace-nowrap pointer-events-none z-10">
                              <span className="bg-[#0f0f18] text-white text-[10px] px-3 py-1.5 rounded-lg shadow-xl border border-[#2a2a40] inline-block font-medium">
                                {formatNumber(Math.round(expense.price_toman / expense.price_usd))} Toman/USD
                              </span>
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 sm:px-4 sm:py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onEdit(expense)}
                            className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-all duration-200"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            disabled={deletingId === expense.id}
                            className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg disabled:opacity-50 transition-all duration-200"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Intersection Observer target and loading indicator */}
          <div ref={observerTarget} className="h-12 flex items-center justify-center">
            {isLoadingMore && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
                <p className="text-sm text-zinc-500 font-medium">Loading more...</p>
              </div>
            )}
            {!hasMore && expenses.length > 0 && (
              <p className="text-sm text-zinc-600">No more expenses to load</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
