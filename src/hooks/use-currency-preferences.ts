'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { PIVOT_CURRENCY } from '@/constants/currencies';
import { queryKeys } from '@/lib/query-keys';

export type NumberFormat = 'auto' | 'compact' | 'full';

export interface CurrencyPreferencesPayload {
  primaryCurrency: string;
  secondaryCurrency: string | null;
  numberFormat: NumberFormat;
}

const DEFAULTS: CurrencyPreferencesPayload = {
  primaryCurrency: PIVOT_CURRENCY,
  secondaryCurrency: 'USD',
  numberFormat: 'auto',
};

async function fetchCurrencyPreferences(): Promise<CurrencyPreferencesPayload> {
  const res = await fetch('/api/settings/currency', { method: 'GET' });
  if (!res.ok) throw new Error('Failed to load currency preferences');
  return res.json();
}

async function updateCurrencyPreferences(
  patch: Partial<CurrencyPreferencesPayload>
): Promise<CurrencyPreferencesPayload> {
  const res = await fetch('/api/settings/currency', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? 'Failed to update currency preferences');
  }
  return res.json();
}

export function useCurrencyPreferences(enabled = true) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.currencyPreferences.all();

  const { data: prefs, isLoading } = useQuery({
    queryKey,
    queryFn: fetchCurrencyPreferences,
    staleTime: 5 * 60 * 1000,
    enabled,
  });

  const mutation = useMutation({
    mutationFn: updateCurrencyPreferences,
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<CurrencyPreferencesPayload>(queryKey);
      if (previous) queryClient.setQueryData<CurrencyPreferencesPayload>(queryKey, { ...previous, ...patch });
      return { previous };
    },
    onError: (_err, _patch, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    prefs: prefs ?? DEFAULTS,
    isLoading,
    mutate: mutation.mutate,
    isMutating: mutation.isPending,
  };
}
