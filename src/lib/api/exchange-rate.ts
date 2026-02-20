export interface ExchangeRateData {
  usd?: { value: string; change: number };
  _meta?: {
    fetchedAt: string;
    freshness?: 'fresh' | 'cached' | 'stale';
    source?: 'navasan' | 'cached' | 'fallback';
    usage?: { monthly: number; remaining: number; limit: number };
  };
}

export async function fetchExchangeRate(): Promise<ExchangeRateData> {
  const response = await fetch('/api/exchange-rate');
  if (!response.ok) throw new Error('Failed to fetch exchange rate');
  return response.json();
}
