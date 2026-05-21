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

import ChartTooltip from '@components/ChartTooltip';
import EmptyState from '@components/EmptyState';
import SegmentedSelector from '@components/SegmentedSelector';
import Pulse from '@components/Skeleton';

import { type NetWorthRange, useNetWorthHistory } from '@hooks/use-net-worth-history';

import { formatChartTooltipDate, formatNumber } from '@utils';

const RANGES: NetWorthRange[] = ['1M', '3M', '6M', '1Y', 'ALL'];

// ─── Custom tooltip ──────────────────────────────────────────────────────────
function NetWorthTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ value: number; payload: { valueUsd: number; valueToman: number } }>;
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <ChartTooltip
      primary={`$${point.valueUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      secondary={`${formatNumber(point.valueToman)} Toman`}
      accent={label != null ? { text: formatChartTooltipDate(String(label), 'daily'), tone: 'success' } : undefined}
    />
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

  // For long ranges (6M+), emit one tick per month — otherwise Recharts repeats
  // the same "MMM 'yy" label across adjacent daily points.
  const xAxisTicks = useMemo(() => {
    if (isShortRange || !data || data.length === 0) return undefined;
    const seen = new Set<string>();
    const ticks: string[] = [];
    for (const point of data) {
      const monthKey = point.date.slice(0, 7);
      if (!seen.has(monthKey)) {
        seen.add(monthKey);
        ticks.push(point.date);
      }
    }
    return ticks;
  }, [data, isShortRange]);

  // Card shell — always rendered so range tabs stay accessible
  const cardHeader = (
    <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
          <TrendingUp className="text-success h-5 w-5" />
        </div>
        <h2 className="text-text-primary text-lg font-semibold">Net Worth</h2>
      </div>
      <SegmentedSelector<NetWorthRange>
        value={range}
        onChange={setRange}
        options={RANGES.map((r) => ({ value: r, label: r === 'ALL' ? 'All' : r }))}
        ariaLabel="Net worth range"
      />
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
        <EmptyState
          icon={TrendingUp}
          title="No history yet"
          description="Update an asset value to record a snapshot and start charting your net worth."
          className="min-h-[280px]"
        />
      )}

      {/* Chart */}
      {hasData && (
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart data={data} margin={{ left: 0, right: 20, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.2} />
                  <stop offset="50%" stopColor="var(--color-success)" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" opacity={0.5} vertical={false} />
              <XAxis
                dataKey="date"
                stroke="var(--color-border-subtle)"
                tick={{ fill: 'var(--color-text-muted)', fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: 'var(--color-border-subtle)' }}
                tickLine={{ stroke: 'var(--color-border-subtle)' }}
                tickMargin={8}
                height={28}
                minTickGap={40}
                interval={xAxisTicks ? 0 : 'preserveStartEnd'}
                ticks={xAxisTicks}
                tickFormatter={formatXTick}
              />
              <YAxis
                stroke="var(--color-border-subtle)"
                tick={{ fill: 'var(--color-text-muted)', fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: 'var(--color-border-subtle)' }}
                tickLine={{ stroke: 'var(--color-border-subtle)' }}
                tickFormatter={(v: number) =>
                  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : `${v}`
                }
              />
              <RechartsTooltip
                content={<NetWorthTooltip />}
                cursor={{ stroke: 'var(--color-success)', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area
                type="monotone"
                dataKey="valueUsd"
                stroke="var(--color-success)"
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
