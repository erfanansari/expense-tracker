'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Trash2, FileText, Edit, Tag } from 'lucide-react';
import { type Expense } from '@/lib/types/expense';
import { formatNumber, formatToFarsiDate, getCategoryLabel } from '@/lib/utils';

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
      <div className="w-full p-4 sm:p-6">
        <p className="text-center text-sm sm:text-base text-zinc-600 dark:text-zinc-400">Loading expenses...</p>
      </div>
    );
  }

  if (error && expenses.length === 0) {
    return (
      <div className="w-full p-4 sm:p-6">
        <p className="text-center text-sm sm:text-base text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
        <h2 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Expense Details / جزئیات هزینه‌ها
        </h2>
      </div>

      {error && expenses.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {expenses.length === 0 ? (
        <div className="w-full p-4 sm:p-6">
          <p className="text-center text-sm sm:text-base text-zinc-600 dark:text-zinc-400">No expenses yet. Add your first expense above!</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full border-collapse">
              <thead className="bg-zinc-100 dark:bg-zinc-800">
                <tr>
                  <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                    Description / توضیحات
                  </th>
                  <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                    Category / دسته‌بندی
                  </th>
                  <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                    Date / تاریخ
                  </th>
                  <th className="px-2 py-2 sm:px-4 sm:py-3 text-right text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                    Amount / مبلغ
                  </th>
                  <th className="px-2 py-2 sm:px-4 sm:py-3 text-center text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-400 w-20 sm:w-25">
                    Actions / عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {expenses.map((expense) => {
                  const categoryLabels = getCategoryLabel(expense.category);
                  const farsiDate = formatToFarsiDate(expense.date);

                  return (
                    <tr
                      key={expense.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        <div className="flex flex-col gap-1">
                          <span>{expense.description}</span>
                          {expense.tags && expense.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {expense.tags.map(tag => (
                                <div
                                  key={tag.id}
                                  className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-[10px] font-medium"
                                >
                                  <Tag className="h-2.5 w-2.5" />
                                  <span>{tag.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm">
                        <div className="flex flex-col">
                          <span className="text-zinc-900 dark:text-zinc-100">{categoryLabels.en}</span>
                          <span className="text-zinc-600 dark:text-zinc-400 text-[10px] sm:text-xs" dir="rtl">
                            {categoryLabels.fa}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm">
                        <div className="flex flex-col">
                          <span className="text-zinc-900 dark:text-zinc-100">{expense.date}</span>
                          <span className="text-zinc-600 dark:text-zinc-400 text-[10px] sm:text-xs" dir="rtl">
                            {farsiDate}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-zinc-900 dark:text-zinc-100 font-medium" dir="rtl">
                            {formatNumber(expense.price_toman)} تومان
                          </span>
                          <span className="relative group/amount text-zinc-600 dark:text-zinc-400 text-[10px] sm:text-xs cursor-help inline-block">
                            ${expense.price_usd.toFixed(2)} USD
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[calc(100%+0.5rem)] hidden group-hover/amount:inline-block whitespace-nowrap pointer-events-none">
                              <span className="bg-zinc-900 dark:bg-zinc-700 text-white text-[10px] px-2 py-1 rounded shadow-lg inline-block">
                                {formatNumber(Math.round(expense.price_toman / expense.price_usd))} Toman/USD
                              </span>
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-2 sm:px-4 sm:py-3">
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                          <button
                            onClick={() => onEdit(expense)}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1"
                            title="Edit"
                          >
                            <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            disabled={deletingId === expense.id}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 transition-colors p-1"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
          <div ref={observerTarget} className="h-10 flex items-center justify-center">
            {isLoadingMore && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading more expenses...</p>
            )}
            {!hasMore && expenses.length > 0 && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">No more expenses to load</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
