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

import { useCurrency } from '@features/ExchangeRate/CurrencyProvider';
import DateRangeSelector, {
  type DateRange,
  filterExpensesByDateRange,
  getChartGranularity,
} from '@features/expenses/components/DateRangeSelector';

import ChartTooltip from '@components/ChartTooltip';
import EmptyState from '@components/EmptyState';

import { formatChartTooltipDate } from '@utils';

import { PIVOT_CURRENCY } from '@/constants/currencies';

import type { SpendingTrendChartProps } from '../../@types';

// ─── Custom recharts tooltip ────────────────────────────────────────────────────
// Chart values are in the pivot currency; the tooltip converts to primary/secondary.
function SpendingTooltip({
  active,
  payload,
  label,
  granularity,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ value?: number | string | ReadonlyArray<number | string> }>;
  label?: string | number;
  granularity: 'daily' | 'weekly' | 'monthly';
}) {
  const { display } = useCurrency();
  if (!active || !payload?.length) return null;
  const rawValue = payload[0].value;
  const numericValue = typeof rawValue === 'number' ? rawValue : Number(rawValue) || 0;
  const { primary, secondary } = display(numericValue, PIVOT_CURRENCY);
  return (
    <ChartTooltip
      primary={primary}
      secondary={secondary ?? undefined}
      accent={label != null ? { text: formatChartTooltipDate(String(label), granularity), tone: 'blue' } : undefined}
    />
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

    const aggregated = new Map<string, { amount: number }>();

    filteredExpenses.forEach((exp) => {
      const date = new Date(`${exp.date}T00:00:00`);
      const pivot = exp.amount * exp.entryRate;
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
        existing.amount += pivot;
      } else {
        aggregated.set(key, { amount: pivot });
      }
    });

    return Array.from(aggregated.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredExpenses, granularity]);

  return (
    <div className="border-border-subtle bg-background relative flex h-full flex-col rounded-xl border p-5 shadow-sm sm:p-6 lg:col-span-2">
      <div className="mb-5 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
            <TrendingUp className="text-blue h-5 w-5" />
          </div>
          <h2 className="text-text-primary text-lg font-semibold">Spending Trend</h2>
        </div>
        <DateRangeSelector value={dateRange} onChange={setDateRange} />
      </div>

      {spendingTrend.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No spending to show"
          description={
            expenses.length === 0
              ? 'Add your first expense to start tracking your spending trend.'
              : 'No spending recorded in this date range. Try a wider range.'
          }
          className="min-h-[320px]"
        />
      ) : (
        <div className="min-h-[320px] flex-1">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart data={spendingTrend} margin={{ left: 0, right: 20, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-blue)" stopOpacity={0.2} />
                  <stop offset="50%" stopColor="var(--color-blue)" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="var(--color-blue)" stopOpacity={0} />
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
                interval="preserveStartEnd"
                tickFormatter={(value: string) => {
                  if (granularity === 'monthly') return format(parseISO(`${value}-01`), 'MMM yyyy');
                  return format(parseISO(value), 'MMM d');
                }}
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
                content={(props) => <SpendingTooltip {...props} granularity={granularity} />}
                cursor={{ stroke: 'var(--color-blue)', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="var(--color-blue)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorAmount)"
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

export default SpendingTrendChart;
