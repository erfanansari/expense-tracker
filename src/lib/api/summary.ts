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

export async function fetchSummary(): Promise<SummaryData> {
  const response = await fetch('/api/summary');
  if (!response.ok) throw new Error('Failed to load summary');
  return response.json();
}
