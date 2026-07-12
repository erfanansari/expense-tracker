'use client';

import { BarChart3, Hash, TrendingUp } from 'lucide-react';

import AnimatedMoney, { AnimatedCount } from '@components/AnimatedMoney';

import { useCurrency } from '@hooks/use-currency';

import { type Expense } from '@/@types/expense';

interface ExpenseStatsProps {
  expenses: Expense[];
}

const ExpenseStats = ({ expenses }: ExpenseStatsProps) => {
  const { primaryCurrency, secondaryCurrency, sumTo, formatFull } = useCurrency();

  // Sum each expense converted at ITS OWN date — historically accurate & stable.
  const items = expenses.map((e) => ({ amount: e.amount, currency: e.currency, date: e.date }));
  const showSecondary = !!secondaryCurrency && secondaryCurrency !== primaryCurrency;

  const totalPrimary = sumTo(items, primaryCurrency);
  const totalSecondary = showSecondary ? sumTo(items, secondaryCurrency) : 0;

  let days = 0;
  if (expenses.length > 0) {
    const dates = expenses.map((exp) => new Date(exp.date).getTime());
    const firstDate = new Date(Math.min(...dates));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    firstDate.setHours(0, 0, 0, 0);
    days = Math.max(1, Math.ceil((today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  }
  const div = days || 1;

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
          <p
            className="text-text-primary text-2xl font-bold tabular-nums sm:text-3xl"
            title={formatFull(totalPrimary, primaryCurrency)}
          >
            <AnimatedMoney amount={totalPrimary} currency={primaryCurrency} />
          </p>
          {showSecondary && (
            <p
              className="text-text-secondary mt-1.5 text-sm font-medium"
              title={formatFull(totalSecondary, secondaryCurrency)}
            >
              <AnimatedMoney amount={totalSecondary} currency={secondaryCurrency} />
            </p>
          )}
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
          <p className="text-text-primary text-2xl font-bold tabular-nums sm:text-3xl">
            <AnimatedCount value={expenses.length} />
          </p>
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
          <p
            className="text-text-primary text-2xl font-bold tabular-nums sm:text-3xl"
            title={formatFull(totalPrimary / div, primaryCurrency)}
          >
            <AnimatedMoney amount={totalPrimary / div} currency={primaryCurrency} />
          </p>
          {showSecondary && (
            <p
              className="text-text-secondary mt-1.5 text-sm font-medium"
              title={formatFull(totalSecondary / div, secondaryCurrency)}
            >
              <AnimatedMoney amount={totalSecondary / div} currency={secondaryCurrency} />
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseStats;
