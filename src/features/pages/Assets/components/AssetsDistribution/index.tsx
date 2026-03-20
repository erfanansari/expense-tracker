import Pulse from '@components/Skeleton';

import { formatNumber } from '@utils';

import type { AssetsDistributionProps } from '../../@types';

function DistributionSkeleton() {
  return (
    <div className="border-border-subtle bg-background rounded-xl border p-6 shadow-sm">
      <Pulse className="mb-5 h-5 w-36" />
      <Pulse className="mb-6 h-3 w-full rounded-full" />
      <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Pulse className="h-2.5 w-2.5 shrink-0 rounded-full" />
            <div className="flex flex-col gap-1">
              <Pulse className="h-3 w-20" />
              <Pulse className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const AssetsDistribution = ({ chartData, totalValueUsd }: AssetsDistributionProps) => {
  if (chartData.length === 0) {
    return <DistributionSkeleton />;
  }

  const sorted = [...chartData].sort((a, b) => b.value - a.value);

  return (
    <div className="border-border-subtle bg-background rounded-xl border p-6 shadow-sm">
      <h3 className="text-text-primary mb-5 text-lg font-semibold">Asset Distribution</h3>

      {/* Stacked bar */}
      <div className="mb-6 flex h-3 w-full overflow-hidden rounded-full">
        {sorted.map((entry) => {
          const pct = totalValueUsd > 0 ? (entry.value / totalValueUsd) * 100 : 0;
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
          const pct = totalValueUsd > 0 ? (entry.value / totalValueUsd) * 100 : 0;
          return (
            <div key={entry.name} className="flex min-w-0 items-center gap-2">
              <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
              <div className="min-w-0">
                <p className="text-text-secondary truncate text-sm">{entry.name}</p>
                <p className="text-text-muted text-xs tabular-nums">
                  {pct.toFixed(1)}% · ${formatNumber(entry.value)}
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
