import { useTranslations } from 'next-intl';

import { SearchX, Sparkles, TrendingUp } from 'lucide-react';

import type { Expense } from '@types';

import { ExpenseCharts } from '@features/expenses/components/ExpenseCharts';

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
  const t = useTranslations('pages.reports');
  const tOnboarding = useTranslations('onboarding.emptyStates');
  const openExpenseDrawer = useDrawerStore((state) => state.openExpenseDrawer);

  if (expenses.length === 0) {
    return (
      <div className="border-border-subtle bg-background rounded-xl border shadow-sm">
        {hasAnyExpenses ? (
          // Filters/date range matched nothing — the data exists, the view doesn't
          <EmptyState
            icon={SearchX}
            title={tOnboarding('noMatch.title')}
            description={tOnboarding('noMatch.description')}
            className="py-20"
            action={
              <Button variant="outline" onClick={onClearFilters}>
                {tOnboarding('noMatch.clearFilters')}
              </Button>
            }
          />
        ) : (
          // First use — no expenses exist at all, so adjusting filters can't help
          <EmptyState
            icon={Sparkles}
            title={tOnboarding('reports.title')}
            description={tOnboarding('reports.description')}
            className="py-20"
            action={
              <Button variant="outline" onClick={() => openExpenseDrawer()}>
                {tOnboarding('addExpense')}
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
          <h2 className="text-text-primary text-lg font-semibold">{t('spendingAnalytics')}</h2>
        </div>
        <ExpenseCharts expenses={expenses} granularity={granularity} />
      </div>
    </div>
  );
};

export default ReportsCharts;
