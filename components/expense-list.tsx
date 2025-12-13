'use client';

import { useEffect, useState } from 'react';
import { type Expense } from '@/lib/types/expense';

interface ExpenseListProps {
  refreshTrigger: number;
}

export function ExpenseList({ refreshTrigger }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/expenses');

      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      } else {
        setError('Failed to load expenses');
      }
    } catch (error) {
      setError('Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [refreshTrigger]);

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <p className="text-center text-zinc-600 dark:text-zinc-400">Loading expenses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <p className="text-center text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <p className="text-center text-zinc-600 dark:text-zinc-400">No expenses yet. Add your first expense above!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6 text-zinc-900 dark:text-zinc-50">All Expenses</h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white dark:bg-zinc-900 shadow-md rounded-lg overflow-hidden">
          <thead className="bg-zinc-100 dark:bg-zinc-800">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">Category</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">Description</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-zinc-900 dark:text-zinc-100">Toman</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-zinc-900 dark:text-zinc-100">USD</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <td className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                  {new Date(expense.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                  {expense.category}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                  {expense.description}
                </td>
                <td className="px-4 py-3 text-sm text-right text-zinc-700 dark:text-zinc-300">
                  {expense.price_toman.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-right text-zinc-700 dark:text-zinc-300">
                  ${expense.price_usd.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
        Total: {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
