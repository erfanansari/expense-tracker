'use client';

import { getNotificationPreferencesKeyGenerator } from '@api/getNotificationPreferencesQuery';
import type { NotificationPreferencesPayload } from '@api/getNotificationPreferencesQuery';
import { updateNotificationPreferencesKeyGenerator } from '@api/updateNotificationPreferencesMutation';
import type { UpdateNotificationPreferencesRequestData } from '@api/updateNotificationPreferencesMutation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type { NotificationPreferencesPayload };

export function useNotificationPreferences() {
  const queryClient = useQueryClient();
  const queryKey = getNotificationPreferencesKeyGenerator();

  const { data: prefs, isLoading } = useQuery<NotificationPreferencesPayload>({ queryKey });

  const mutation = useMutation<NotificationPreferencesPayload, Error, UpdateNotificationPreferencesRequestData>({
    mutationKey: updateNotificationPreferencesKeyGenerator(),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<NotificationPreferencesPayload>(queryKey);
      if (previous) {
        queryClient.setQueryData<NotificationPreferencesPayload>(queryKey, { ...previous, ...patch });
      }
      return { previous };
    },
    onError: (_err, _patch, context) => {
      const typedContext = context as { previous?: NotificationPreferencesPayload } | undefined;
      if (typedContext?.previous) queryClient.setQueryData(queryKey, typedContext.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    prefs,
    isLoading,
    mutate: mutation.mutate,
    isMutating: mutation.isPending,
  };
}
