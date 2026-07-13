import { SearchX, Sparkles, TrendingUp } from 'lucide-react';

import type { Expense } from '@types';

import { ExpenseCharts } from '@features/expenses/components/ExpenseCharts';
import { onboardingCopy } from '@features/onboarding/copy';

import Button from '@components/Button';
import EmptyState from '@components/EmptyState';

import { useDrawerStore } from '@stores/drawer';

interface ReportsChartsProps {
  expenses: Expense[];
  granularity: 'daily' | 'weekly' | 'monthly';
  /** Whether ANY expenses exist (unfiltered) — distinguishes first-use from filters matching nothing. */
  hasAnyExpenses: boolean;
  onClearFilters: () => void;
}

const ReportsCharts = ({ expenses, granularity, hasAnyExpenses, onClearFilters }: ReportsChartsProps) => {
  const openExpenseDrawer = useDrawerStore((state) => state.openExpenseDrawer);

  if (expenses.length === 0) {
    return (
      <div className="border-border-subtle bg-background rounded-xl border shadow-sm">
        {hasAnyExpenses ? (
          // Filters/date range matched nothing — the data exists, the view doesn't
          <EmptyState
            icon={SearchX}
            title={onboardingCopy.emptyStates.noMatch.title}
            description={onboardingCopy.emptyStates.noMatch.description}
            className="py-20"
            action={
              <Button variant="outline" onClick={onClearFilters}>
                {onboardingCopy.emptyStates.noMatch.clearFilters}
              </Button>
            }
          />
        ) : (
          // First use — no expenses exist at all, so adjusting filters can't help
          <EmptyState
            icon={Sparkles}
            title={onboardingCopy.emptyStates.reports.title}
            description={onboardingCopy.emptyStates.reports.description}
            className="py-20"
            action={
              <Button variant="outline" onClick={() => openExpenseDrawer()}>
                {onboardingCopy.emptyStates.addExpense}
              </Button>
            }
          />
        )}
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
