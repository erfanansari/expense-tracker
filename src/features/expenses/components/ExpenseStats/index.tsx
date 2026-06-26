'use client';

import { BarChart3, Hash, TrendingUp } from 'lucide-react';

import Money from '@components/Money';

import { type Expense } from '@/@types/expense';
import { PIVOT_CURRENCY } from '@/constants/currencies';

interface ExpenseStatsProps {
  expenses: Expense[];
}

const ExpenseStats = ({ expenses }: ExpenseStatsProps) => {
  // Totals are computed in the pivot currency (amount * entryRate); the Money
  // component converts to the user's primary/secondary currency for display.
  const totalPivot = expenses.reduce((sum, exp) => sum + exp.amount * exp.entryRate, 0);

  let avgDailyPivot = 0;
  if (expenses.length > 0) {
    const dates = expenses.map((exp) => new Date(exp.date).getTime());
    const firstDate = new Date(Math.min(...dates));
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    firstDate.setHours(0, 0, 0, 0);

    const totalDays = Math.ceil((today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    avgDailyPivot = totalDays > 0 ? totalPivot / totalDays : 0;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
      {/* Total Expenses */}
      <div className="border-border-subtle bg-background relative rounded-xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
            <TrendingUp className="text-blue h-5 w-5" />
          </div>
        </div>

        <div>
          <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">Total Expenses</p>
          <Money
            amount={totalPivot}
            currency={PIVOT_CURRENCY}
            primaryClassName="text-text-primary text-2xl font-bold tabular-nums sm:text-3xl"
            secondaryClassName="text-text-secondary mt-1.5 text-sm font-medium"
          />
        </div>
      </div>

      {/* Number of Expenses */}
      <div className="border-border-subtle bg-background relative rounded-xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
            <Hash className="text-success h-5 w-5" />
          </div>
        </div>

        <div>
          <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">Expenses</p>
          <p className="text-text-primary text-2xl font-bold tabular-nums sm:text-3xl">{expenses.length}</p>
          <p className="text-text-secondary mt-1.5 text-sm font-medium">Expenses</p>
        </div>
      </div>

      {/* Average Daily Spending */}
      <div className="border-border-subtle bg-background relative rounded-xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
            <BarChart3 className="text-text-secondary h-5 w-5" />
          </div>
        </div>

        <div>
          <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">Daily Average</p>
          <Money
            amount={avgDailyPivot}
            currency={PIVOT_CURRENCY}
            primaryClassName="text-text-primary text-2xl font-bold tabular-nums sm:text-3xl"
            secondaryClassName="text-text-secondary mt-1.5 text-sm font-medium"
          />
        </div>
      </div>
    </div>
  );
};

export default ExpenseStats;
