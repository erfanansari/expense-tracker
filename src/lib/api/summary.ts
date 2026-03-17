import { apiFetch } from './client';

export interface SummaryData {
  current_month_income_usd: number;
  current_month_income_toman: number;
  current_month_expenses_usd: number;
  current_month_expenses_toman: number;
  total_income_usd: number;
  total_income_toman: number;
  total_expenses_usd: number;
  total_expenses_toman: number;
  net_worth_usd: number;
  net_worth_toman: number;
}

export const fetchSummary = () => apiFetch<SummaryData>('/api/summary');
