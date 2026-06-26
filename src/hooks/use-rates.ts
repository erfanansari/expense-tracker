import { useQuery } from '@tanstack/react-query';

import { fetchRatesWithHistory } from '@/lib/api/rates';
import { queryKeys } from '@/lib/query-keys';

// Rates change at most daily (cron-driven), so cache aggressively.
const RATES_STALE_TIME = 30 * 60 * 1000;

/**
 * Loads the full historical rate series + latest map once and shares it across
 * the app. The series is needed so historical records convert at their own date.
 */
export function useRates(enabled = true) {
  return useQuery({
    queryKey: queryKeys.rates.withHistory(),
    queryFn: fetchRatesWithHistory,
    staleTime: RATES_STALE_TIME,
    enabled,
  });
}
