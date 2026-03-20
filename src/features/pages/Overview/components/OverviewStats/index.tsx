import { Banknote, TrendingDown, TrendingUp } from 'lucide-react';

import { formatNumber } from '@utils';

import type { OverviewStatsProps } from '../../@types';

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
        <p className="text-text-primary text-2xl font-semibold tabular-nums sm:text-3xl">
          {formatNumber(summary?.net_worth_toman ?? 0)} <span className="text-text-muted text-lg">Toman</span>
        </p>
        <p className="text-text-secondary mt-1.5 text-sm font-medium">
          ${(summary?.net_worth_usd ?? 0).toFixed(2)} USD
        </p>
      </div>

      {/* Total Income */}
      <div className="border-border-subtle bg-background relative min-w-0 rounded-xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
            <TrendingUp className="text-success h-5 w-5" />
          </div>
        </div>
        <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">Total Income</p>
        <p className="text-text-primary text-2xl font-semibold tabular-nums sm:text-3xl">
          {formatNumber(summary?.total_income_toman ?? 0)} <span className="text-text-muted text-lg">Toman</span>
        </p>
        <p className="text-text-secondary mt-1.5 text-sm font-medium">
          ${(summary?.total_income_usd ?? 0).toFixed(2)} USD
        </p>
      </div>

      {/* Total Expenses */}
      <div className="border-border-subtle bg-background relative min-w-0 rounded-xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
            <TrendingDown className="text-danger h-5 w-5" />
          </div>
        </div>
        <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">Total Expenses</p>
        <p className="text-text-primary text-2xl font-semibold tabular-nums sm:text-3xl">
          {formatNumber(summary?.total_expenses_toman ?? 0)} <span className="text-text-muted text-lg">Toman</span>
        </p>
        <p className="text-text-secondary mt-1.5 text-sm font-medium">
          ${(summary?.total_expenses_usd ?? 0).toFixed(2)} USD
        </p>
      </div>
    </>
  );
};

export default OverviewStats;
