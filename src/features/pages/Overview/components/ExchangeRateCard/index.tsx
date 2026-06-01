import { DollarSign, Info, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

import Tooltip from '@components/Tooltip';

import { useExchangeRate } from '@hooks/use-exchange-rate';

import { formatNumber } from '@utils';

const ExchangeRateCard = () => {
  const { data: rateData, isLoading } = useExchangeRate();

  if (isLoading || !rateData?.usd) {
    return (
      <div className="border-border-subtle bg-background relative min-w-0 rounded-xl border p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
            <DollarSign className="text-text-secondary h-5 w-5" />
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

  const { value, change } = rateData.usd;
  const rate = parseInt(value, 10);
  const isZero = change === 0;
  const freshness = rateData._meta?.freshness || 'cached';
  const usage = rateData._meta?.usage;

  const lastUpdate = rateData._meta?.fetchedAt
    ? new Date(rateData._meta.fetchedAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const freshnessStyles = {
    fresh: 'bg-success-light text-success border-success/20',
    cached: 'bg-warning-light text-warning border-warning/20',
    stale: 'bg-danger-light text-danger border-danger/20',
  };

  const freshnessLabels = {
    fresh: 'Live',
    cached: 'Cached',
    stale: 'Old',
  };

  const sourceLabels = {
    navasan: 'Navasan API',
    cached: 'Database',
    fallback: 'Fallback',
  };

  const tooltipContent = (
    <div className="space-y-1.5 text-xs whitespace-nowrap">
      <div className="flex items-center justify-between gap-6">
        <span className="text-zinc-400">Status</span>
        <span
          className={twMerge(
            'font-medium',
            freshness === 'fresh' ? 'text-green-400' : freshness === 'cached' ? 'text-yellow-400' : 'text-red-400'
          )}
        >
          {freshnessLabels[freshness]}
        </span>
      </div>
      <div className="flex items-center justify-between gap-6">
        <span className="text-zinc-400">Source</span>
        <span className="font-medium text-zinc-200">{sourceLabels[rateData._meta?.source || 'cached']}</span>
      </div>
      <div className="flex items-center justify-between gap-6">
        <span className="text-zinc-400">Updated</span>
        <span className="font-medium text-zinc-200">{lastUpdate}</span>
      </div>
      {usage && (
        <>
          <div className="my-1.5 border-t border-zinc-700" />
          <div className="flex items-center justify-between gap-6">
            <span className="text-zinc-400">API Remaining</span>
            <span
              className={twMerge('font-medium tabular-nums', usage.remaining < 10 ? 'text-red-400' : 'text-zinc-200')}
            >
              {usage.remaining}/{usage.limit}
            </span>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="border-border-subtle bg-background relative min-w-0 rounded-xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
          <DollarSign className="text-text-secondary h-5 w-5" />
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
                {change > 0 ? '+' : ''}
                {formatNumber(Math.abs(change))}
              </span>
            </>
          )}
        </div>
      </div>

      <div>
        <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">Exchange Rate</p>
        <p className="text-text-primary text-2xl font-semibold tabular-nums sm:text-3xl">
          {formatNumber(rate)} <span className="text-text-muted text-lg">Toman</span>
        </p>
        <div className="flex items-center justify-between gap-2">
          {lastUpdate && <span className="text-text-secondary mt-1.5 text-sm font-medium">Updated {lastUpdate}</span>}
          <div className="flex items-center gap-x-2">
            <span
              className={twMerge('rounded border px-1.5 py-0.5 text-[10px] font-medium', freshnessStyles[freshness])}
            >
              {freshnessLabels[freshness]}
            </span>
            <Tooltip content={tooltipContent} position="left">
              <span className="text-text-muted hover:text-text-secondary transition-colors">
                <Info className="h-3.5 w-3.5" />
              </span>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExchangeRateCard;
