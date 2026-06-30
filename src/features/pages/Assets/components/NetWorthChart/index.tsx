'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

import { useCurrency } from '@features/ExchangeRate/CurrencyProvider';

import ChartTooltip from '@components/ChartTooltip';
import EmptyState from '@components/EmptyState';
import ErrorState from '@components/ErrorState';
import SegmentedSelector from '@components/SegmentedSelector';
import Pulse from '@components/Skeleton';

import { type NetWorthRange, useNetWorthHistory } from '@hooks/use-net-worth-history';

import { formatChartTooltipDate } from '@utils';

import { PIVOT_CURRENCY } from '@/constants/currencies';

const RANGES: NetWorthRange[] = ['1M', '3M', '6M', '1Y', 'ALL'];

// ─── Custom tooltip ──────────────────────────────────────────────────────────
// Net-worth points are in the pivot currency; the tooltip converts for display.
function NetWorthTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{
    value: number;
    payload: { date: string; value: number };
  }>;
}) {
  const { display } = useCurrency();
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  // Convert at the point's own date so the secondary is historically accurate & stable.
  const { primary, secondary } = display(point.value, PIVOT_CURRENCY, point.date, { compact: true });
  return (
    <ChartTooltip
      primary={primary}
      secondary={secondary ?? undefined}
      accent={{ text: formatChartTooltipDate(point.date, 'daily'), tone: 'success' }}
    />
  );
}

// ─── Delta badge ─────────────────────────────────────────────────────────────
function DeltaBadge({ data }: { data: Array<{ value: number }> }) {
  const { display } = useCurrency();
  const { deltaPivot, deltaPercent, isPositive } = useMemo(() => {
    if (data.length < 2) return { deltaPivot: 0, deltaPercent: 0, isPositive: true };
    const first = data[0].value;
    const last = data[data.length - 1].value;
    const d = last - first;
    const pct = first !== 0 ? (d / first) * 100 : 0;
    return { deltaPivot: d, deltaPercent: pct, isPositive: d >= 0 };
  }, [data]);

  if (data.length < 2) return null;

  const sign = isPositive ? '+' : '';
  const color = isPositive ? 'text-success' : 'text-danger';

  return (
    <span className={`text-sm font-medium ${color}`}>
      {sign}
      {display(Math.abs(deltaPivot), PIVOT_CURRENCY, undefined, { compact: true }).primary} ({sign}
      {deltaPercent.toFixed(1)}%)
    </span>
  );
}

const NetWorthChart = () => {
  const [range, setRange] = useState<NetWorthRange>('6M');
  const { data, isLoading, isError, error, refetch } = useNetWorthHistory(range);

  const isShortRange = range === '1M' || range === '3M';

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(0);

  useEffect(() => {
    const node = chartContainerRef.current;
    if (!node) return;
    setChartWidth(node.clientWidth);
    const observer = new ResizeObserver((entries) => {
      setChartWidth(entries[0].contentRect.width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const formatXTick = useCallback(
    (value: number) => format(value, isShortRange ? 'MMM d' : "MMM ''yy"),
    [isShortRange]
  );

  const hasData = !isLoading && !isError && data && data.length >= 2;
  const isEmpty = !isLoading && !isError && (!data || data.length < 2);

  // Project each point to an epoch-ms timestamp so the X-axis can use a real
  // time scale; categorical positioning made clustered snapshots collapse on top
  // of each other on narrow screens.
  const chartData = useMemo(() => (data ?? []).map((p) => ({ ...p, timestamp: parseISO(p.date).getTime() })), [data]);

  const xDomain = useMemo<[number, number] | undefined>(() => {
    if (chartData.length === 0) return undefined;
    return [chartData[0].timestamp, chartData[chartData.length - 1].timestamp];
  }, [chartData]);

  // Build tick timestamps based on range: daily for short ranges anchor on first/last
  // and intermediate ticks; monthly for long ranges. Subsampled to fit width.
  const xAxisTicks = useMemo<number[] | undefined>(() => {
    if (chartData.length === 0 || !xDomain) return undefined;

    const [startTs, endTs] = xDomain;
    const startDate = new Date(startTs);

    if (isShortRange) {
      // Let Recharts auto-place ticks for short ranges (it positions them along
      // the time scale with minTickGap, which handles overlap correctly).
      return undefined;
    }

    // Monthly ticks at the 1st of each month within the visible domain.
    const monthlyTicks: number[] = [];
    const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    // Skip the first month-start if it falls before the domain start.
    if (cursor.getTime() < startTs) cursor.setMonth(cursor.getMonth() + 1);
    while (cursor.getTime() <= endTs) {
      monthlyTicks.push(cursor.getTime());
      cursor.setMonth(cursor.getMonth() + 1);
    }
    if (monthlyTicks.length === 0) return undefined;

    if (chartWidth === 0) return monthlyTicks;
    // ~70px per "MMM 'yy" label keeps adjacent labels from touching.
    const LABEL_WIDTH = 70;
    const maxTicks = Math.max(2, Math.floor(chartWidth / LABEL_WIDTH));
    if (monthlyTicks.length <= maxTicks) return monthlyTicks;

    const step = Math.ceil(monthlyTicks.length / maxTicks);
    return monthlyTicks.filter((_, i) => i % step === 0);
  }, [chartData, xDomain, isShortRange, chartWidth]);

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
        <ErrorState
          title="Couldn't load net worth history"
          description={error?.message ?? 'An unexpected error occurred while loading this data.'}
          onRetry={() => refetch()}
          className="min-h-[280px]"
        />
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
        <div ref={chartContainerRef} className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart data={chartData} margin={{ left: 0, right: 20, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.2} />
                  <stop offset="50%" stopColor="var(--color-success)" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" opacity={0.5} vertical={false} />
              <XAxis
                dataKey="timestamp"
                type="number"
                scale="time"
                domain={xDomain ?? ['dataMin', 'dataMax']}
                stroke="var(--color-border-subtle)"
                tick={{ fill: 'var(--color-text-muted)', fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: 'var(--color-border-subtle)' }}
                tickLine={{ stroke: 'var(--color-border-subtle)' }}
                tickMargin={8}
                height={28}
                minTickGap={40}
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
                dataKey="value"
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
