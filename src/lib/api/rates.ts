import type { LatestRates, RatesSeries } from '@features/ExchangeRate/utils/currency';

import { apiFetch } from './client';

export interface RatesResponse {
  latest: LatestRates;
  series?: RatesSeries;
}

export const fetchRates = () => apiFetch<RatesResponse>('/api/rates');

export const fetchRatesWithHistory = () => apiFetch<RatesResponse>('/api/rates?history=1');
