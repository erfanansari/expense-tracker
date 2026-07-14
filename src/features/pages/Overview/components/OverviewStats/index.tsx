import type { FC, ReactNode } from 'react';

import { useTranslations } from 'next-intl';

import type { SummaryPair } from '@api/getSummaryQuery';
import { Banknote, TrendingDown, TrendingUp } from 'lucide-react';

import AnimatedMoney from '@components/AnimatedMoney';
import StatZeroState from '@components/StatZeroState';

import { useCurrency } from '@hooks/use-currency';

import type { OverviewStatsProps } from '../../@types';

const primaryClass = 'text-text-primary text-2xl font-semibold tabular-nums sm:text-3xl';
const secondaryClass = 'text-text-secondary mt-1.5 text-sm font-medium';

interface StatCardProps {
  label: string;
  icon: ReactNode;
  pair?: SummaryPair;
  emptyCaption: string;
  primaryCurrency: string;
  secondaryCurrency: string | null;
  formatFull: (value: number, currency: string) => string;
}

const StatCard: FC<StatCardProps> = ({
  label,
  icon,
  pair,
  emptyCaption,
  primaryCurrency,
  secondaryCurrency,
  formatFull,
}) => {
  const p = pair?.primary ?? 0;
  const s = pair?.secondary ?? 0;
  // 0/0 means "nothing recorded", not "your total is zero" — show that honestly
  // instead of a broken-looking "0 IRT".
  const isEmpty = p === 0 && s === 0;
  return (
    <div className="border-border-subtle bg-background relative min-w-0 rounded-xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">{icon}</div>
      </div>
      <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">{label}</p>
      {isEmpty ? (
        <StatZeroState caption={emptyCaption} />
      ) : (
        <>
          <p className={primaryClass} title={formatFull(p, primaryCurrency)}>
            <AnimatedMoney amount={p} currency={primaryCurrency} />
          </p>
          {secondaryCurrency && (
            <p className={secondaryClass} title={formatFull(s, secondaryCurrency)}>
              <AnimatedMoney amount={s} currency={secondaryCurrency} />
            </p>
          )}
        </>
      )}
    </div>
  );
};

const OverviewStats = ({ summary }: OverviewStatsProps) => {
  const t = useTranslations('pages.overview.stats');
  const tZero = useTranslations('onboarding.zeroCaptions');
  const { formatFull, primaryCurrency: ctxPrimary, secondaryCurrency: ctxSecondary } = useCurrency();

  // Totals arrive already converted (per-record, historical). Fall back to the
  // context currencies while the summary is still loading.
  const primaryCurrency = summary?.primaryCurrency ?? ctxPrimary;
  const secondaryCurrency = summary?.secondaryCurrency ?? ctxSecondary;
  const shared = { primaryCurrency, secondaryCurrency, formatFull };

  return (
    <>
      <StatCard
        label={t('netWorth')}
        icon={<Banknote className="text-success h-5 w-5" />}
        pair={summary?.net_worth}
        emptyCaption={tZero('netWorth')}
        {...shared}
      />
      <StatCard
        label={t('totalIncome')}
        icon={<TrendingUp className="text-success h-5 w-5" />}
        pair={summary?.total_income}
        emptyCaption={tZero('income')}
        {...shared}
      />
      <StatCard
        label={t('totalExpenses')}
        icon={<TrendingDown className="text-danger h-5 w-5" />}
        pair={summary?.total_expenses}
        emptyCaption={tZero('expenses')}
        {...shared}
      />
    </>
  );
};

export default OverviewStats;
