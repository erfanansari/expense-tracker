import { PieChart } from 'lucide-react';

import { useCurrency } from '@features/ExchangeRate/CurrencyProvider';

import EmptyState from '@components/EmptyState';

import { PIVOT_CURRENCY } from '@/constants/currencies';

import type { AssetsDistributionProps } from '../../@types';

const AssetsDistribution = ({ chartData, totalValue }: AssetsDistributionProps) => {
  const { display } = useCurrency();

  if (chartData.length === 0) {
    return (
      <div className="border-border-subtle bg-background rounded-xl border p-6 shadow-sm">
        <h3 className="text-text-primary mb-2 text-lg font-semibold">Asset Distribution</h3>
        <EmptyState
          icon={PieChart}
          title="No assets to distribute"
          description="Add an asset to see how your wealth is split across categories."
        />
      </div>
    );
  }

  const sorted = [...chartData].sort((a, b) => b.value - a.value);

  return (
    <div className="border-border-subtle bg-background rounded-xl border p-6 shadow-sm">
      <h3 className="text-text-primary mb-5 text-lg font-semibold">Asset Distribution</h3>

      {/* Stacked bar */}
      <div className="mb-6 flex h-3 w-full overflow-hidden rounded-full">
        {sorted.map((entry) => {
          const pct = totalValue > 0 ? (entry.value / totalValue) * 100 : 0;
          return (
            <div
              key={entry.name}
              className="h-full"
              style={{ width: `${pct}%`, backgroundColor: entry.color }}
              title={`${entry.name}: ${pct.toFixed(1)}%`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {sorted.map((entry) => {
          const pct = totalValue > 0 ? (entry.value / totalValue) * 100 : 0;
          return (
            <div key={entry.name} className="flex min-w-0 items-center gap-2">
              <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
              <div className="min-w-0">
                <p className="text-text-secondary truncate text-sm">{entry.name}</p>
                <p className="text-text-muted text-xs tabular-nums">
                  {pct.toFixed(1)}% · {display(entry.value, PIVOT_CURRENCY).primary}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssetsDistribution;
