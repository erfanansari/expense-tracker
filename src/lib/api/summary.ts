import { apiFetch } from './client';

/** A total already converted server-side, per-record at each record's date. */
export interface SummaryPair {
  primary: number;
  secondary: number | null;
}

export interface SummaryData {
  primaryCurrency: string;
  secondaryCurrency: string | null;
  total_income: SummaryPair;
  total_expenses: SummaryPair;
  net_worth: SummaryPair;
}

export const fetchSummary = () => apiFetch<SummaryData>('/api/summary');
