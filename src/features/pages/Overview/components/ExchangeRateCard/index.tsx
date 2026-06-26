import { Coins, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

import { useCurrency } from '@features/ExchangeRate/CurrencyProvider';

import { formatNumber } from '@utils';

import { getCurrency, PIVOT_CURRENCY } from '@/constants/currencies';

const cardWrapper =
  'border-border-subtle bg-background relative min-w-0 rounded-xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6';

const ExchangeRateCard = () => {
  const { secondaryCurrency, primaryCurrency, series, isLoading } = useCurrency();

  // Show the rate of the most relevant foreign currency against IRT — the
  // secondary if it's a real foreign currency, otherwise the primary.
  const displayCode =
    secondaryCurrency && secondaryCurrency !== PIVOT_CURRENCY
      ? secondaryCurrency
      : primaryCurrency !== PIVOT_CURRENCY
        ? primaryCurrency
        : null;

  if (isLoading) {
    return (
      <div className={cardWrapper}>
        <div className="mb-4 flex items-center justify-between">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
            <Coins className="text-text-secondary h-5 w-5" />
          </div>
        </div>
        <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">Exchange Rate</p>
        <div className="flex items-center gap-2">
          <div className="border-border-subtle border-t-info h-5 w-5 animate-spin rounded-full border-2" />
          <p className="text-text-muted text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // No foreign currency selected (both primary & secondary are IRT, or secondary off).
  if (!displayCode) {
    return (
      <div className={cardWrapper}>
        <div className="mb-4 flex items-center justify-between">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
            <Coins className="text-text-secondary h-5 w-5" />
          </div>
        </div>
        <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">Exchange Rate</p>
        <p className="text-text-secondary text-sm">Pick a foreign secondary currency in Settings to track its rate.</p>
      </div>
    );
  }

  const def = getCurrency(displayCode);
  // Ignore any future-dated rows — "current" rate is the most recent on or before today.
  const today = new Date().toISOString().split('T')[0];
  const points = (series[displayCode] ?? []).filter((p) => p.rateDate <= today);
  const latest = points[points.length - 1];
  const prev = points[points.length - 2];

  if (!latest) {
    return (
      <div className={cardWrapper}>
        <div className="mb-4 flex items-center justify-between">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
            <span className="text-text-secondary text-sm font-semibold">{def.symbol}</span>
          </div>
        </div>
        <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">1 {def.code} =</p>
        <p className="text-text-primary text-2xl font-semibold sm:text-3xl">—</p>
        <p className="text-text-secondary mt-1.5 text-sm font-medium">{def.label} · rate unavailable</p>
      </div>
    );
  }

  const rate = latest.rate; // IRT per 1 unit of displayCode
  const change = prev ? rate - prev.rate : 0;
  const pct = prev && prev.rate ? (change / prev.rate) * 100 : 0;
  const isZero = change === 0;

  const isFresh = latest.rateDate === today;

  return (
    <div className={cardWrapper}>
      <div className="mb-4 flex items-center justify-between">
        <div className="border-border-subtle bg-background-secondary flex h-10 w-10 items-center justify-center rounded-lg border">
          <span className="text-text-secondary text-sm font-semibold">{def.symbol}</span>
        </div>
        <div
          className={twMerge(
            'flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold',
            (() => {
              if (isZero) return 'border-border-subtle bg-background-secondary text-text-muted';
              if (change > 0) return 'border-border-subtle bg-success-light text-success';
              return 'border-border-subtle bg-danger-light text-danger';
            })()
          )}
        >
          {isZero ? (
            <>
              <Minus className="h-3 w-3" />
              <span>Stable</span>
            </>
          ) : (
            <>
              {change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>
                {change > 0 ? '+' : '−'}
                {Math.abs(pct).toFixed(1)}%
              </span>
            </>
          )}
        </div>
      </div>

      <div>
        <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">1 {def.code} =</p>
        <p className="text-text-primary text-2xl font-semibold tabular-nums sm:text-3xl">
          {formatNumber(rate)} <span className="text-text-muted text-lg">IRT</span>
        </p>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <span className="text-text-secondary text-sm font-medium">{def.label}</span>
          <span
            className={twMerge(
              'rounded border px-1.5 py-0.5 text-[10px] font-medium',
              isFresh
                ? 'bg-success-light text-success border-success/20'
                : 'bg-warning-light text-warning border-warning/20'
            )}
          >
            {isFresh ? 'Live' : latest.rateDate}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExchangeRateCard;
