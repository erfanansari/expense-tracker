import { useQuery } from '@tanstack/react-query';

import { fetchExchangeRate } from '@/lib/api/exchange-rate';
import { queryKeys } from '@/lib/query-keys';

// 30 minutes stale time — shared cache across all 4 consumers
const EXCHANGE_RATE_STALE_TIME = 30 * 60 * 1000;

export function useExchangeRate() {
  return useQuery({
    queryKey: queryKeys.exchangeRate.current(),
    queryFn: fetchExchangeRate,
    staleTime: EXCHANGE_RATE_STALE_TIME,
  });
}
