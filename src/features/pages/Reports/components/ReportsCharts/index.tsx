import { Sparkles, TrendingUp } from 'lucide-react';

import type { Expense } from '@types';

import { ExpenseCharts } from '@features/expenses/components/ExpenseCharts';

import EmptyState from '@components/EmptyState';

interface ReportsChartsProps {
  expenses: Expense[];
  granularity: 'daily' | 'weekly' | 'monthly';
}

const ReportsCharts = ({ expenses, granularity }: ReportsChartsProps) => {
  if (expenses.length === 0) {
    return (
      <div className="border-border-subtle bg-background rounded-xl border shadow-sm">
        <EmptyState
          icon={Sparkles}
          title="No data available"
          description="No expenses found for the selected period. Try adjusting your date range."
          className="py-20"
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="border-border-subtle bg-background rounded-xl border p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2">
            <TrendingUp className="text-blue h-4 w-4" />
          </div>
          <h2 className="text-text-primary text-lg font-semibold">Spending Analytics</h2>
        </div>
        <ExpenseCharts expenses={expenses} granularity={granularity} />
      </div>
    </div>
  );
};

export default ReportsCharts;
