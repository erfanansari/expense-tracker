import type { SummaryData } from '@/lib/api/summary';

export interface OverviewStatsProps {
  summary: SummaryData | undefined;
}

export interface SpendingTrendChartProps {
  expenses: { date: string; amount: number; entryRate: number }[];
}
