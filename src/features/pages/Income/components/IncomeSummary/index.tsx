import { getMonthLabel } from '@constants/income';
import { Banknote, DollarSign, TrendingUp } from 'lucide-react';

import { onboardingCopy } from '@features/onboarding/copy';

import AnimatedMoney from '@components/AnimatedMoney';
import { ZERO_CAPTION_CLASS, ZERO_VALUE_CLASS } from '@components/StatZeroState';

import { useCurrency } from '@hooks/use-currency';
import type { MoneyItem } from '@hooks/use-currency';

import type { Income } from '@/@types/income';

import type { IncomeSummaryProps } from '../../@types';

// Income is dated at the first of its month for historical rate lookup.
const toItem = (inc: Income): MoneyItem => ({
  amount: inc.amount,
  currency: inc.currency,
  date: `${inc.year}-${String(inc.month).padStart(2, '0')}-01`,
});

const IncomeSummary = ({ incomes }: IncomeSummaryProps) => {
  const { primaryCurrency, secondaryCurrency, sumTo, formatFull } = useCurrency();
  const showSecondary = !!secondaryCurrency && secondaryCurrency !== primaryCurrency;

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  // Each income converted at its OWN month's rate, then summed — accurate & stable.
  const sumPair = (list: Income[]) => {
    const items = list.map(toItem);
    return {
      p: sumTo(items, primaryCurrency),
      s: showSecondary ? sumTo(items, secondaryCurrency || primaryCurrency) : 0,
    };
  };

  const all = sumPair(incomes);
  const ytd = sumPair(incomes.filter((inc) => inc.year === currentYear));
  const last = sumPair(incomes.filter((inc) => inc.year === lastMonthYear && inc.month === lastMonth));
  const distinctMonths = new Set(incomes.map((inc) => `${inc.year}-${inc.month}`)).size;
  const avg = { p: distinctMonths ? all.p / distinctMonths : 0, s: distinctMonths ? all.s / distinctMonths : 0 };

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

  const hasIncomes = incomes.length > 0;

  const renderPair = (p: number, s: number, primaryClass: string) =>
    hasIncomes ? (
      <>
        <p className={primaryClass} title={formatFull(p, primaryCurrency)}>
          <AnimatedMoney amount={p} currency={primaryCurrency} />
        </p>
        {showSecondary && secondaryCurrency && (
          <p className="text-text-muted text-xs" title={formatFull(s, secondaryCurrency)}>
            <AnimatedMoney amount={s} currency={secondaryCurrency} />
          </p>
        )}
      </>
    ) : (
      <p className={ZERO_VALUE_CLASS}>—</p>
    );

  // Empty captions are muted like every other zero-state card; real context lines stay secondary.
  const captionClass = hasIncomes ? 'text-text-secondary mt-1.5 text-sm font-medium' : ZERO_CAPTION_CLASS;

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
      {/* Total Income (All Time) */}
      <div className="border-border-subtle bg-background relative min-w-0 rounded-xl border p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
            <Banknote className="text-success h-5 w-5" />
          </div>
        </div>
        <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">Total Income</p>
        {renderPair(all.p, all.s, 'text-success text-2xl font-semibold tabular-nums')}
        <p className={captionClass}>{hasIncomes ? incomeSpanLabel : onboardingCopy.zeroCaptions.incomeTotal}</p>
      </div>

      {/* YTD Income */}
      <div className="border-border-subtle bg-background relative min-w-0 rounded-xl border p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
            <TrendingUp className="text-blue h-5 w-5" />
          </div>
        </div>
        <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">YTD Income</p>
        {renderPair(ytd.p, ytd.s, 'text-text-primary text-2xl font-semibold tabular-nums')}
        <p className={captionClass}>{hasIncomes ? currentYear : onboardingCopy.zeroCaptions.incomeYtd}</p>
      </div>

      {/* Last Month */}
      <div className="border-border-subtle bg-background relative min-w-0 rounded-xl border p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
            <DollarSign className="text-text-secondary h-5 w-5" />
          </div>
        </div>
        <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">Last Month</p>
        {renderPair(last.p, last.s, 'text-text-primary text-2xl font-semibold tabular-nums')}
        <p className={captionClass}>
          {hasIncomes ? `${getMonthLabel(lastMonth).en} ${lastMonthYear}` : onboardingCopy.zeroCaptions.incomeLastMonth}
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
        {renderPair(avg.p, avg.s, 'text-text-primary text-2xl font-semibold tabular-nums')}
        <p className={captionClass}>
          {hasIncomes
            ? `over ${distinctMonths} month${distinctMonths !== 1 ? 's' : ''}`
            : onboardingCopy.zeroCaptions.incomeAverage}
        </p>
      </div>
    </div>
  );
};

export default IncomeSummary;
