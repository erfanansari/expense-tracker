import { getMonthLabel } from '@constants/income';
import { Banknote, DollarSign, TrendingUp } from 'lucide-react';

import Money from '@components/Money';

import { PIVOT_CURRENCY } from '@/constants/currencies';

import type { IncomeSummaryProps } from '../../@types';

const IncomeSummary = ({ incomes }: IncomeSummaryProps) => {
  // All aggregates are in the pivot currency (amount * entryRate); Money converts
  // to the user's primary/secondary currency for display.
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const pivot = (inc: { amount: number; entryRate: number }) => inc.amount * inc.entryRate;

  const ytdIncome = incomes.filter((inc) => inc.year === currentYear).reduce((sum, inc) => sum + pivot(inc), 0);

  const lastMonthIncome = incomes
    .filter((inc) => inc.year === lastMonthYear && inc.month === lastMonth)
    .reduce((sum, inc) => sum + pivot(inc), 0);

  const totalIncomeAllTime = incomes.reduce((sum, inc) => sum + pivot(inc), 0);

  const distinctMonths = new Set(incomes.map((inc) => `${inc.year}-${inc.month}`)).size;
  const avgMonthlyIncome = distinctMonths > 0 ? totalIncomeAllTime / distinctMonths : 0;

  // Date span covered by all income — the Total Income card's context line.
  const sortedByPeriod = [...incomes].sort((a, b) => a.year - b.year || a.month - b.month);
  const earliest = sortedByPeriod[0];
  const latest = sortedByPeriod[sortedByPeriod.length - 1];

  let incomeSpanLabel = 'All time';
  if (earliest) {
    const sameMonth = earliest.year === latest.year && earliest.month === latest.month;
    incomeSpanLabel = sameMonth
      ? `${getMonthLabel(earliest.month).en} ${earliest.year}`
      : `${getMonthLabel(earliest.month).en.slice(0, 3)} ${earliest.year} – ${getMonthLabel(latest.month).en.slice(0, 3)} ${latest.year}`;
  }

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
        <Money
          amount={totalIncomeAllTime}
          currency={PIVOT_CURRENCY}
          primaryClassName="text-success text-2xl font-semibold tabular-nums"
          secondaryClassName="text-text-muted text-xs"
        />
        <p className="text-text-secondary mt-1.5 text-sm font-medium">{incomeSpanLabel}</p>
      </div>

      {/* YTD Income */}
      <div className="border-border-subtle bg-background relative min-w-0 rounded-xl border p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
            <TrendingUp className="text-blue h-5 w-5" />
          </div>
        </div>
        <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">YTD Income</p>
        <Money
          amount={ytdIncome}
          currency={PIVOT_CURRENCY}
          primaryClassName="text-text-primary text-2xl font-semibold tabular-nums"
          secondaryClassName="text-text-muted text-xs"
        />
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
        <Money
          amount={lastMonthIncome}
          currency={PIVOT_CURRENCY}
          primaryClassName="text-text-primary text-2xl font-semibold tabular-nums"
          secondaryClassName="text-text-muted text-xs"
        />
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
        <Money
          amount={avgMonthlyIncome}
          currency={PIVOT_CURRENCY}
          primaryClassName="text-text-primary text-2xl font-semibold tabular-nums"
          secondaryClassName="text-text-muted text-xs"
        />
        <p className="text-text-secondary mt-1.5 text-sm font-medium">
          over {distinctMonths} month{distinctMonths !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};

export default IncomeSummary;
