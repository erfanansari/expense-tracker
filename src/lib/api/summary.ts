import { apiFetch } from './client';

// All values are in the pivot currency (IRT); the client converts for display.
export interface SummaryData {
  current_month_income: number;
  current_month_expenses: number;
  total_income: number;
  total_expenses: number;
  total_assets: number;
  net_worth: number;
}

export const fetchSummary = () => apiFetch<SummaryData>('/api/summary');
