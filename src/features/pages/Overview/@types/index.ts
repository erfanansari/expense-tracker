import type { SummaryData } from '@api/getSummaryQuery';

export interface OverviewStatsProps {
  summary: SummaryData | undefined;
}

export interface SpendingTrendChartProps {
  expenses: { date: string; amount: number; entryRate: number }[];
}
