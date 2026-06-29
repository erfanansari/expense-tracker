import type { FC, ReactNode } from 'react';

import { Banknote, TrendingDown, TrendingUp } from 'lucide-react';

import { useCurrency } from '@features/ExchangeRate/CurrencyProvider';

import type { SummaryPair } from '@/lib/api/summary';

import type { OverviewStatsProps } from '../../@types';

const primaryClass = 'text-text-primary text-2xl font-semibold tabular-nums sm:text-3xl';
const secondaryClass = 'text-text-secondary mt-1.5 text-sm font-medium';

interface StatCardProps {
  label: string;
  icon: ReactNode;
  pair?: SummaryPair;
  primaryCurrency: string;
  secondaryCurrency: string | null;
  format: (value: number, currency: string) => string;
}

const StatCard: FC<StatCardProps> = ({ label, icon, pair, primaryCurrency, secondaryCurrency, format }) => (
  <div className="border-border-subtle bg-background relative min-w-0 rounded-xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6">
    <div className="mb-4 flex items-center justify-between">
      <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">{icon}</div>
    </div>
    <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">{label}</p>
    <p className={primaryClass}>{format(pair?.primary ?? 0, primaryCurrency)}</p>
    {secondaryCurrency && <p className={secondaryClass}>{format(pair?.secondary ?? 0, secondaryCurrency)}</p>}
  </div>
);

const OverviewStats = ({ summary }: OverviewStatsProps) => {
  const { format, primaryCurrency: ctxPrimary, secondaryCurrency: ctxSecondary } = useCurrency();

  // Totals arrive already converted (per-record, historical). Fall back to the
  // context currencies while the summary is still loading.
  const primaryCurrency = summary?.primaryCurrency ?? ctxPrimary;
  const secondaryCurrency = summary?.secondaryCurrency ?? ctxSecondary;
  const shared = { primaryCurrency, secondaryCurrency, format };

  return (
    <>
      <StatCard
        label="Net Worth"
        icon={<Banknote className="text-success h-5 w-5" />}
        pair={summary?.net_worth}
        {...shared}
      />
      <StatCard
        label="Total Income"
        icon={<TrendingUp className="text-success h-5 w-5" />}
        pair={summary?.total_income}
        {...shared}
      />
      <StatCard
        label="Total Expenses"
        icon={<TrendingDown className="text-danger h-5 w-5" />}
        pair={summary?.total_expenses}
        {...shared}
      />
    </>
  );
};

export default OverviewStats;
