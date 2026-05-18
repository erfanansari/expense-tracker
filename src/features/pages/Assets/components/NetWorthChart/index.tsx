'use client';

import { useCallback, useMemo, useState } from 'react';

import { format, parseISO } from 'date-fns';
import { TrendingUp } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

import Pulse from '@components/Skeleton';

import { type NetWorthRange, useNetWorthHistory } from '@hooks/use-net-worth-history';

import { formatNumber } from '@utils';

const RANGES: NetWorthRange[] = ['1M', '3M', '6M', '1Y', 'ALL'];

// ─── Custom tooltip ──────────────────────────────────────────────────────────
function NetWorthTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: { valueUsd: number; valueToman: number } }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="border-border-subtle bg-background rounded-lg border p-4 shadow-lg">
      <p className="text-text-primary text-lg font-bold">
        ${point.valueUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
      <p className="text-text-muted mt-1.5 text-sm font-medium">{formatNumber(point.valueToman)} Toman</p>
      {label && <p className="text-success mt-2 text-sm font-medium">{label}</p>}
    </div>
  );
}

// ─── Delta badge ─────────────────────────────────────────────────────────────
function DeltaBadge({ data }: { data: Array<{ valueUsd: number }> }) {
  const { deltaUsd, deltaPercent, isPositive } = useMemo(() => {
    if (data.length < 2) return { deltaUsd: 0, deltaPercent: 0, isPositive: true };
    const first = data[0].valueUsd;
    const last = data[data.length - 1].valueUsd;
    const d = last - first;
    const pct = first !== 0 ? (d / first) * 100 : 0;
    return { deltaUsd: d, deltaPercent: pct, isPositive: d >= 0 };
  }, [data]);

  if (data.length < 2) return null;

  const sign = isPositive ? '+' : '';
  const color = isPositive ? 'text-success' : 'text-danger';

  return (
    <span className={`text-sm font-medium ${color}`}>
      {sign}${Math.abs(deltaUsd).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (
      {sign}
      {deltaPercent.toFixed(1)}%)
    </span>
  );
}

const NetWorthChart = () => {
  const [range, setRange] = useState<NetWorthRange>('6M');
  const { data, isLoading, isError } = useNetWorthHistory(range);

  const isShortRange = range === '1M' || range === '3M';

  const formatXTick = useCallback(
    (value: string) => format(parseISO(value), isShortRange ? 'MMM d' : "MMM ''yy"),
    [isShortRange]
  );

  const hasData = !isLoading && !isError && data && data.length >= 2;
  const isEmpty = !isLoading && !isError && (!data || data.length < 2);

  // Card shell — always rendered so range tabs stay accessible
  const cardHeader = (
    <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
          <TrendingUp className="text-success h-5 w-5" />
        </div>
        <h2 className="text-text-primary text-lg font-semibold">Net Worth</h2>
      </div>
      <div className="bg-background-secondary flex gap-1 self-start rounded-lg p-1 sm:self-auto">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              range === r ? 'bg-text-primary text-background shadow-sm' : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {r === 'ALL' ? 'All' : r}
          </button>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="border-border-subtle bg-background rounded-xl border p-5 shadow-sm sm:p-6">
        {/* Header skeleton — matches actual two-row mobile / one-row desktop layout */}
        <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Pulse className="h-10 w-10 shrink-0 rounded-lg" />
            <Pulse className="h-5 w-28" />
          </div>
          <Pulse className="h-8 w-40 self-start rounded-lg sm:self-auto" />
        </div>
        <Pulse className="h-[280px] w-full rounded-lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="border-border-subtle bg-background rounded-xl border p-5 shadow-sm sm:p-6">
        {cardHeader}
        <div className="flex h-[280px] items-center justify-center">
          <p className="text-danger text-sm">Failed to load net worth history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-border-subtle bg-background rounded-xl border p-5 shadow-sm sm:p-6">
      {cardHeader}

      {/* Delta badge */}
      {hasData && (
        <div className="mb-4">
          <DeltaBadge data={data ?? []} />
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="flex h-[280px] items-center justify-center">
          <p className="text-text-muted text-sm">
            Not enough data to display chart. Update an asset value to record a snapshot.
          </p>
        </div>
      )}

      {/* Chart */}
      {hasData && (
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart data={data} margin={{ left: 0, right: 20, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="50%" stopColor="#10b981" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" opacity={0.5} vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#e5e5e5"
                tick={{ fill: '#a3a3a3', fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: '#e5e5e5' }}
                tickLine={{ stroke: '#e5e5e5' }}
                tickMargin={8}
                height={28}
                minTickGap={40}
                interval="preserveStartEnd"
                tickFormatter={formatXTick}
              />
              <YAxis
                stroke="#e5e5e5"
                tick={{ fill: '#a3a3a3', fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: '#e5e5e5' }}
                tickLine={{ stroke: '#e5e5e5' }}
                tickFormatter={(v: number) =>
                  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : `${v}`
                }
              />
              <RechartsTooltip
                content={<NetWorthTooltip />}
                cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area
                type="monotone"
                dataKey="valueUsd"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorNetWorth)"
                animationDuration={1000}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default NetWorthChart;
