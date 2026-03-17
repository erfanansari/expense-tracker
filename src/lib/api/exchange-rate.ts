import { apiFetch } from './client';

export interface ExchangeRateData {
  usd?: { value: string; change: number };
  _meta?: {
    fetchedAt: string;
    freshness?: 'fresh' | 'cached' | 'stale';
    source?: 'navasan' | 'cached' | 'fallback';
    usage?: { monthly: number; remaining: number; limit: number };
  };
}

export const fetchExchangeRate = () => apiFetch<ExchangeRateData>('/api/exchange-rate');
