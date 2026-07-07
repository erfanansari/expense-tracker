import { getRatesKeyGenerator } from '@api/getRatesQuery';
import type { RatesResponse } from '@api/getRatesQuery';
import { useQuery } from '@tanstack/react-query';

// Rates change at most daily (cron-driven), so cache aggressively.
const RATES_STALE_TIME = 30 * 60 * 1000;

/**
 * Loads the full historical rate series + latest map once and shares it across
 * the app. The series is needed so historical records convert at their own date.
 */
export function useRates(enabled = true) {
  return useQuery<RatesResponse>({
    queryKey: getRatesKeyGenerator(),
    staleTime: RATES_STALE_TIME,
    enabled,
  });
}
