'use client';

import { getCurrencyPreferencesKeyGenerator } from '@api/getCurrencyPreferencesQuery';
import { SUMMARY_SCOPE } from '@api/getSummaryQuery';
import { updateCurrencyPreferencesKeyGenerator } from '@api/updateCurrencyPreferencesMutation';
import type { UpdateCurrencyPreferencesRequestData } from '@api/updateCurrencyPreferencesMutation';
import { PIVOT_CURRENCY } from '@constants/currencies';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CurrencyPreferencesPayload } from '@stores/currency';

export type { NumberFormat } from '@stores/currency';
export type { CurrencyPreferencesPayload };

const DEFAULTS: CurrencyPreferencesPayload = {
  primaryCurrency: PIVOT_CURRENCY,
  secondaryCurrency: 'USD',
  numberFormat: 'auto',
};

export function useCurrencyPreferences(enabled = true) {
  const queryClient = useQueryClient();
  const queryKey = getCurrencyPreferencesKeyGenerator();

  const { data: prefs, isLoading } = useQuery<CurrencyPreferencesPayload>({ queryKey, enabled });

  const mutation = useMutation<CurrencyPreferencesPayload, Error, UpdateCurrencyPreferencesRequestData>({
    mutationKey: updateCurrencyPreferencesKeyGenerator(),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<CurrencyPreferencesPayload>(queryKey);
      if (previous) queryClient.setQueryData<CurrencyPreferencesPayload>(queryKey, { ...previous, ...patch });
      return { previous };
    },
    onError: (_err, _patch, context) => {
      const typedContext = context as { previous?: CurrencyPreferencesPayload } | undefined;
      if (typedContext?.previous) queryClient.setQueryData(queryKey, typedContext.previous);
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey }),
        // /api/summary computes totals in the user's currency server-side, so its
        // cache is stale after a currency change — refetch it in the new currency.
        queryClient.invalidateQueries({ queryKey: SUMMARY_SCOPE }),
      ]),
  });

  return {
    prefs: prefs ?? DEFAULTS,
    isLoading,
    mutate: mutation.mutate,
    isMutating: mutation.isPending,
  };
}
