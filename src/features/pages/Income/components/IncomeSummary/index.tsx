import { getMonthLabel } from '@constants/income';
import { Banknote, DollarSign, TrendingUp } from 'lucide-react';

import { formatNumber } from '@utils';

import type { IncomeSummaryProps } from '../../@types';

const IncomeSummary = ({ incomes }: IncomeSummaryProps) => {
  // Variables
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const ytdIncome = incomes.filter((inc) => inc.year === currentYear).reduce((sum, inc) => sum + inc.amountUsd, 0);

  const lastMonthIncome = incomes
    .filter((inc) => inc.year === lastMonthYear && inc.month === lastMonth)
    .reduce((sum, inc) => sum + inc.amountUsd, 0);

  const totalIncomeAllTime = incomes.reduce((sum, inc) => sum + inc.amountUsd, 0);
  const totalIncomeAllTimeToman = incomes.reduce((sum, inc) => sum + inc.amountToman, 0);

  const distinctMonths = new Set(incomes.map((inc) => `${inc.year}-${inc.month}`)).size;
  const avgMonthlyIncome = distinctMonths > 0 ? totalIncomeAllTime / distinctMonths : 0;

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
      {/* Total Income (All Time) */}
      <div className="border-border-subtle bg-background relative min-w-0 rounded-xl border p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="border-success/20 bg-success-light rounded-lg border p-2.5">
            <Banknote className="text-success h-5 w-5" />
          </div>
        </div>
        <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">Total Income</p>
        <p className="text-success text-2xl font-semibold tabular-nums">${formatNumber(totalIncomeAllTime)}</p>
        <p className="text-text-secondary mt-1.5 text-sm font-medium">{formatNumber(totalIncomeAllTimeToman)} Toman</p>
      </div>

      {/* YTD Income */}
      <div className="border-border-subtle bg-background relative min-w-0 rounded-xl border p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
            <TrendingUp className="text-blue h-5 w-5" />
          </div>
        </div>
        <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">YTD Income</p>
        <p className="text-text-primary text-2xl font-semibold tabular-nums">${formatNumber(ytdIncome)}</p>
        <p className="text-text-secondary mt-1.5 text-sm font-medium">{currentYear}</p>
      </div>

      {/* Last Month */}
      <div className="border-border-subtle bg-background relative min-w-0 rounded-xl border p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
            <DollarSign className="text-text-secondary h-5 w-5" />
          </div>
        </div>
        <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">Last Month</p>
        <p className="text-text-primary text-2xl font-semibold tabular-nums">${formatNumber(lastMonthIncome)}</p>
        <p className="text-text-secondary mt-1.5 text-sm font-medium">
          {getMonthLabel(lastMonth).en} {lastMonthYear}
        </p>
      </div>

      {/* Monthly Average */}
      <div className="border-border-subtle bg-background relative min-w-0 rounded-xl border p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
            <TrendingUp className="text-text-secondary h-5 w-5" />
          </div>
        </div>
        <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">Monthly Average</p>
        <p className="text-text-primary text-2xl font-semibold tabular-nums">
          ${formatNumber(Math.round(avgMonthlyIncome))}
        </p>
        <p className="text-text-secondary mt-1.5 text-sm font-medium">
          over {distinctMonths} month{distinctMonths !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};

export default IncomeSummary;
