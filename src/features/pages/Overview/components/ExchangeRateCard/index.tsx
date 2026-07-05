import { Coins, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

import { useCurrency } from '@features/ExchangeRate/CurrencyProvider';
import { formatMoney, rateOn } from '@features/ExchangeRate/utils/currency';

import { getCurrency, PIVOT_CURRENCY } from '@/constants/currencies';

const cardWrapper =
  'border-border-subtle bg-background relative min-w-0 rounded-xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6';

const ExchangeRateCard = () => {
  const { secondaryCurrency, primaryCurrency, series, isLoading } = useCurrency();

  // The card shows the rate between the two currencies the user actually uses,
  // derived through the IRT pivot. "Auto direction": the stronger unit (more IRT
  // per unit) is the base, so the number always reads ≥ 1 and naturally
  // (e.g. "1 USD = 38.6 TRY", and the default "1 USD = 176,200 IRT").
  const today = new Date().toISOString().split('T')[0];
  const secondary = secondaryCurrency && secondaryCurrency !== primaryCurrency ? secondaryCurrency : null;

  // Determine the pair. With no distinct secondary, pair a foreign primary
  // against IRT; if the sole currency is IRT there's nothing to show.
  let base: string | null = null;
  let quote: string | null = null;
  if (!secondary) {
    if (primaryCurrency !== PIVOT_CURRENCY) {
      base = primaryCurrency;
      quote = PIVOT_CURRENCY;
    }
  } else {
    // Larger current pivot rate → base. PIVOT_CURRENCY has an implicit rate of 1,
    // so a foreign currency always wins as base against IRT.
    const rPrimary = rateOn(series, primaryCurrency, today) ?? 0;
    const rSecondary = rateOn(series, secondary, today) ?? 0;
    if (rSecondary > rPrimary) {
      base = secondary;
      quote = primaryCurrency;
    } else {
      base = primaryCurrency;
      quote = secondary;
    }
  }

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
  if (base === null || quote === null) {
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

  const def = getCurrency(base);
  const quoteDef = getCurrency(quote);

  // Cross-rate = IRT-per-base ÷ IRT-per-quote, carried forward at each date.
  // Trend uses the union of both currencies' rate dates (on/before today); when
  // the quote is IRT that union is just the base series, matching prior behavior.
  const crossOn = (date: string): number | null => {
    const rb = rateOn(series, base, date);
    const rq = rateOn(series, quote, date);
    if (rb === null || rq === null || rq === 0) return null;
    return rb / rq;
  };

  const unionDates = Array.from(
    new Set([...(series[base] ?? []), ...(series[quote] ?? [])].map((p) => p.rateDate).filter((d) => d <= today))
  ).sort();

  const latestDate = unionDates[unionDates.length - 1];
  const prevDate = unionDates[unionDates.length - 2];
  const rate = latestDate ? crossOn(latestDate) : null;
  const prevRate = prevDate ? crossOn(prevDate) : null;

  if (rate === null) {
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

  const change = prevRate !== null ? rate - prevRate : 0;
  const pct = prevRate ? (change / prevRate) * 100 : 0;
  const isZero = change === 0;

  const isFresh = latestDate === today;

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
          {formatMoney(rate, quoteDef.code)}
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
            {isFresh ? 'Live' : latestDate}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExchangeRateCard;
