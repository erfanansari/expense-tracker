import { Banknote, TrendingDown, TrendingUp } from 'lucide-react';

import Money from '@components/Money';

import { PIVOT_CURRENCY } from '@/constants/currencies';

import type { OverviewStatsProps } from '../../@types';

const primaryClass = 'text-text-primary text-2xl font-semibold tabular-nums sm:text-3xl';
const secondaryClass = 'text-text-secondary mt-1.5 text-sm font-medium';

const OverviewStats = ({ summary }: OverviewStatsProps) => {
  return (
    <>
      {/* Net Worth */}
      <div className="border-border-subtle bg-background relative min-w-0 rounded-xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
            <Banknote className="text-success h-5 w-5" />
          </div>
        </div>
        <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">Net Worth</p>
        <Money
          amount={summary?.net_worth ?? 0}
          currency={PIVOT_CURRENCY}
          primaryClassName={primaryClass}
          secondaryClassName={secondaryClass}
        />
      </div>

      {/* Total Income */}
      <div className="border-border-subtle bg-background relative min-w-0 rounded-xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
            <TrendingUp className="text-success h-5 w-5" />
          </div>
        </div>
        <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">Total Income</p>
        <Money
          amount={summary?.total_income ?? 0}
          currency={PIVOT_CURRENCY}
          primaryClassName={primaryClass}
          secondaryClassName={secondaryClass}
        />
      </div>

      {/* Total Expenses */}
      <div className="border-border-subtle bg-background relative min-w-0 rounded-xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
            <TrendingDown className="text-danger h-5 w-5" />
          </div>
        </div>
        <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">Total Expenses</p>
        <Money
          amount={summary?.total_expenses ?? 0}
          currency={PIVOT_CURRENCY}
          primaryClassName={primaryClass}
          secondaryClassName={secondaryClass}
        />
      </div>
    </>
  );
};

export default OverviewStats;
