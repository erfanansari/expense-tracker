import { useMemo, useState } from 'react';

import { format, parseISO, startOfWeek } from 'date-fns';
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

import DateRangeSelector, {
  type DateRange,
  filterExpensesByDateRange,
  getChartGranularity,
} from '@features/expenses/components/DateRangeSelector';

import { formatNumber } from '@utils';

import type { SpendingTrendChartProps } from '../../@types';

// ─── Custom recharts tooltip ────────────────────────────────────────────────────
function SpendingTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: { usdValue?: number } }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const usdValue = payload[0]?.payload?.usdValue || 0;
  return (
    <div className="border-border-subtle bg-background rounded-lg border p-4 shadow-lg">
      <p className="text-text-primary text-lg font-bold">{formatNumber(payload[0].value)} Toman</p>
      <p className="text-text-muted mt-1.5 text-sm font-medium">${usdValue.toFixed(2)} USD</p>
      {label && <p className="text-blue mt-2 text-sm font-medium">{label}</p>}
    </div>
  );
}

// ─── Aggregation helpers ────────────────────────────────────────────────────────
function getWeekKey(date: Date): string {
  return format(startOfWeek(date), 'yyyy-MM-dd');
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
}

const SpendingTrendChart = ({ expenses }: SpendingTrendChartProps) => {
  // States
  const [dateRange, setDateRange] = useState<DateRange>('30D');

  // Memos
  const filteredExpenses = useMemo(() => filterExpensesByDateRange(expenses, dateRange), [expenses, dateRange]);
  const granularity = useMemo(() => getChartGranularity(dateRange), [dateRange]);

  const spendingTrend = useMemo(() => {
    if (filteredExpenses.length === 0) return [];

    const aggregated = new Map<string, { amount: number; usdValue: number }>();

    filteredExpenses.forEach((exp) => {
      const date = new Date(`${exp.date}T00:00:00`);
      let key: string;

      switch (granularity) {
        case 'weekly':
          key = getWeekKey(date);
          break;
        case 'monthly':
          key = getMonthKey(date);
          break;
        case 'daily':
        default:
          key = exp.date;
          break;
      }

      const existing = aggregated.get(key);
      if (existing) {
        existing.amount += exp.price_toman;
        existing.usdValue += exp.price_usd;
      } else {
        aggregated.set(key, { amount: exp.price_toman, usdValue: exp.price_usd });
      }
    });

    return Array.from(aggregated.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredExpenses, granularity]);

  return (
    <div className="border-border-subtle bg-background relative rounded-xl border p-5 shadow-sm sm:p-6 lg:col-span-2">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
            <TrendingUp className="text-blue h-5 w-5" />
          </div>
          <h2 className="text-text-primary text-lg font-semibold">Spending Trend</h2>
        </div>
        <DateRangeSelector value={dateRange} onChange={setDateRange} />
      </div>

      <div className="h-[450px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <AreaChart data={spendingTrend} margin={{ left: 0, right: 20, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0070f3" stopOpacity={0.2} />
                <stop offset="50%" stopColor="#0070f3" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#0070f3" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" opacity={0.5} vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#e5e5e5"
              tick={{ fill: '#a3a3a3', fontSize: 12, fontWeight: 500 }}
              axisLine={{ stroke: '#e5e5e5' }}
              tickLine={{ stroke: '#e5e5e5' }}
              minTickGap={40}
              interval="preserveStartEnd"
              tickFormatter={(value: string) => {
                if (granularity === 'monthly') return format(parseISO(`${value}-01`), 'MMM yyyy');
                return format(parseISO(value), 'MMM d');
              }}
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
              content={<SpendingTooltip />}
              cursor={{ stroke: '#0070f3', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#0070f3"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorAmount)"
              animationDuration={1000}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SpendingTrendChart;
