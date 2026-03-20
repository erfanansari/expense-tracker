import { Sparkles, TrendingUp } from 'lucide-react';

import type { Expense } from '@types';

import { ExpenseCharts } from '@features/expenses/components/ExpenseCharts';

interface ReportsChartsProps {
  expenses: Expense[];
  granularity: 'daily' | 'weekly' | 'monthly';
}

const ReportsCharts = ({ expenses, granularity }: ReportsChartsProps) => {
  if (expenses.length === 0) {
    return (
      <div className="border-border-subtle bg-background rounded-xl border p-16 text-center shadow-sm">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4">
          <div className="border-border-subtle bg-background-secondary rounded-xl border p-4">
            <Sparkles className="text-text-muted h-10 w-10" />
          </div>
          <div>
            <h3 className="text-text-primary mb-2 text-lg font-semibold">No data available</h3>
            <p className="text-text-muted">
              No transactions found for the selected period. Try adjusting your date range.
            </p>
          </div>
        </div>
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
