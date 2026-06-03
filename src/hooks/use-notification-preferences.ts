'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';

export interface NotificationPreferencesPayload {
  emailEnabled: boolean;
  monthlyReportEnabled: boolean;
  yearlyReportEnabled: boolean;
}

async function fetchPreferences(): Promise<NotificationPreferencesPayload> {
  const res = await fetch('/api/settings/notifications', { method: 'GET' });
  if (!res.ok) throw new Error('Failed to load notification preferences');
  return res.json();
}

async function updatePreferences(
  patch: Partial<NotificationPreferencesPayload>
): Promise<NotificationPreferencesPayload> {
  const res = await fetch('/api/settings/notifications', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? 'Failed to update preferences');
  }
  return res.json();
}

export function useNotificationPreferences() {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.notifications.preferences();

  const { data: prefs, isLoading } = useQuery({
    queryKey,
    queryFn: fetchPreferences,
    staleTime: 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: updatePreferences,
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<NotificationPreferencesPayload>(queryKey);
      if (previous) {
        queryClient.setQueryData<NotificationPreferencesPayload>(queryKey, { ...previous, ...patch });
      }
      return { previous };
    },
    onError: (_err, _patch, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
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
