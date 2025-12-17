'use client';

import { TrendingUp, Hash, BarChart3 } from 'lucide-react';
import { type Expense } from '@/lib/types/expense';
import { formatNumber } from '@/lib/utils';

interface ExpenseStatsProps {
  expenses: Expense[];
}

export function ExpenseStats({ expenses }: ExpenseStatsProps) {
  const totalToman = expenses.reduce((sum, exp) => sum + exp.price_toman, 0);
  const totalUsd = expenses.reduce((sum, exp) => sum + exp.price_usd, 0);

  // Calculate average daily spending from first expense to today (including zero-spending days)
  let avgDailyToman = 0;
  let avgDailyUsd = 0;

  if (expenses.length > 0) {
    const dates = expenses.map(exp => new Date(exp.date).getTime());
    const firstDate = new Date(Math.min(...dates));
    const today = new Date();

    // Reset today to start of day for accurate day count
    today.setHours(0, 0, 0, 0);
    firstDate.setHours(0, 0, 0, 0);

    // Calculate total days from first expense to today (inclusive)
    const totalDays = Math.ceil((today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    avgDailyToman = totalDays > 0 ? totalToman / totalDays : 0;
    avgDailyUsd = totalDays > 0 ? totalUsd / totalDays : 0;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
      {/* Total Expenses */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Total Expenses / کل هزینه‌ها
          </h3>
        </div>
        <div className="space-y-1">
          <p className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50" dir="rtl">
            {formatNumber(totalToman)} تومان
          </p>
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
            ${totalUsd.toFixed(2)} USD
          </p>
        </div>
      </div>

      {/* Number of Transactions */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-2">
          <Hash className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
          <h3 className="text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Number of Transactions / تعداد تراکنش
          </h3>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {expenses.length}
        </p>
      </div>

      {/* Average Daily Spending */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Average Daily Spending / میانگین هزینه روزانه
          </h3>
        </div>
        <div className="space-y-1">
          <p className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50" dir="rtl">
            {formatNumber(avgDailyToman)} تومان
          </p>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            ${avgDailyUsd.toFixed(2)} USD
          </p>
        </div>
      </div>
    </div>
  );
}
