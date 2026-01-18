'use client';

import { ArrowDownRight, ArrowUpRight, BarChart3, Hash, Sparkles, TrendingUp } from 'lucide-react';

import { type Expense } from '@/@types/expense';
import { formatNumber } from '@/utils';

interface ExpenseStatsProps {
  expenses: Expense[];
}

const ExpenseStats = ({ expenses }: ExpenseStatsProps) => {
  const totalToman = expenses.reduce((sum, exp) => sum + exp.price_toman, 0);
  const totalUsd = expenses.reduce((sum, exp) => sum + exp.price_usd, 0);

  // Calculate average daily spending from first expense to today (including zero-spending days)
  let avgDailyToman = 0;
  let avgDailyUsd = 0;

  if (expenses.length > 0) {
    const dates = expenses.map((exp) => new Date(exp.date).getTime());
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
    <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
      {/* Total Expenses */}
      <div className="border-border-subtle bg-background relative rounded-xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
            <TrendingUp className="text-blue h-5 w-5" />
          </div>
          <div className="border-success/20 bg-success-light text-success flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium">
            <ArrowUpRight className="h-3 w-3" />
            <span>12.5%</span>
          </div>
        </div>

        <div>
          <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">Total Expenses</p>
          <p className="text-text-primary text-2xl font-bold tabular-nums sm:text-3xl" dir="rtl">
            {formatNumber(totalToman)} <span className="text-text-muted text-lg">تومان</span>
          </p>
          <p className="text-text-secondary mt-1.5 text-sm font-medium">${totalUsd.toFixed(2)} USD</p>
        </div>
      </div>

      {/* Number of Transactions */}
      <div className="border-border-subtle bg-background relative rounded-xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
            <Hash className="text-success h-5 w-5" />
          </div>
          <div className="border-blue/20 bg-blue/10 text-blue flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium">
            <Sparkles className="h-3 w-3" />
            <span>Active</span>
          </div>
        </div>

        <div>
          <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">Transactions</p>
          <p className="text-text-primary text-2xl font-bold tabular-nums sm:text-3xl">{expenses.length}</p>
          <p className="text-text-secondary mt-1.5 text-sm font-medium" dir="rtl">
            تعداد تراکنش
          </p>
        </div>
      </div>

      {/* Average Daily Spending */}
      <div className="border-border-subtle bg-background relative rounded-xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
            <BarChart3 className="text-text-secondary h-5 w-5" />
          </div>
          <div className="border-danger/20 bg-danger-light text-danger flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium">
            <ArrowDownRight className="h-3 w-3" />
            <span>3.2%</span>
          </div>
        </div>

        <div>
          <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">Daily Average</p>
          <p className="text-text-primary text-2xl font-bold tabular-nums sm:text-3xl" dir="rtl">
            {formatNumber(avgDailyToman)} <span className="text-text-muted text-lg">تومان</span>
          </p>
          <p className="text-text-secondary mt-1.5 text-sm font-medium">${avgDailyUsd.toFixed(2)} USD</p>
        </div>
      </div>
    </div>
  );
};

export default ExpenseStats;
