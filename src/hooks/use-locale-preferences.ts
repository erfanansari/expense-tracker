'use client';

import { getLocalePreferencesKeyGenerator } from '@api/getLocalePreferencesQuery';
import type { LocalePreferencesPayload } from '@api/getLocalePreferencesQuery';
import { updateLocalePreferencesKeyGenerator } from '@api/updateLocalePreferencesMutation';
import type { UpdateLocalePreferencesRequestData } from '@api/updateLocalePreferencesMutation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type { LocalePreferencesPayload };

const DEFAULTS: LocalePreferencesPayload = {
  locale: 'en',
  calendar: 'auto',
  secondaryDateCaptions: true,
};

export function useLocalePreferences(enabled = true) {
  const queryClient = useQueryClient();
  const queryKey = getLocalePreferencesKeyGenerator();

  const { data: prefs, isLoading } = useQuery<LocalePreferencesPayload>({ queryKey, enabled });

  const mutation = useMutation<LocalePreferencesPayload, Error, UpdateLocalePreferencesRequestData>({
    mutationKey: updateLocalePreferencesKeyGenerator(),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<LocalePreferencesPayload>(queryKey);
      if (previous) queryClient.setQueryData<LocalePreferencesPayload>(queryKey, { ...previous, ...patch });
      return { previous };
    },
    onError: (_err, _patch, context) => {
      const typedContext = context as { previous?: LocalePreferencesPayload } | undefined;
      if (typedContext?.previous) queryClient.setQueryData(queryKey, typedContext.previous);
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
