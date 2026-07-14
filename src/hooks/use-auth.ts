'use client';

import { useCallback } from 'react';

import { useTranslations } from 'next-intl';

import { getMeKeyGenerator } from '@api/getMeQuery';
import type { GetMeResponse } from '@api/getMeQuery';
import { logoutKeyGenerator } from '@api/logoutMutation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { AuthUser } from '@types';

import { beginSignout } from '@core/client/auth-handler';

import { useToast } from '@stores/toast';

export function useAuth() {
  const t = useTranslations('nav');
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Queries
  const { data: user, isLoading: loading, error, refetch } = useQuery<GetMeResponse>({ queryKey: getMeKeyGenerator() });

  // Mutations
  const { mutateAsync: logoutAsync } = useMutation<void, Error, void>({
    mutationKey: logoutKeyGenerator(),
  });

  // Callbacks
  const logout = useCallback(async () => {
    // Own the signout so AuthGuard / the 401 listener don't stack a second
    // toast or redirect on top of this one.
    beginSignout();
    try {
      await logoutAsync();
    } catch {
      // Even if the request fails, still redirect — /login is the safest
      // state either way, and the proxy will bounce us back if the cookie
      // somehow survived.
    }
    showToast(t('loggedOutToast'), 'info');
    // Hard navigation rather than router.push: guarantees a fresh request so
    // the proxy re-evaluates the (now-deleted) cookie server-side, and the
    // full page load wipes all in-memory state (including the query cache) —
    // no need to clear it here, which would only flash a refetch loader.
    window.location.href = '/login';
  }, [logoutAsync, showToast, t]);

  const updateUser = useCallback(
    (updates: Partial<AuthUser>) => {
      queryClient.setQueryData(getMeKeyGenerator(), (prev: AuthUser | null | undefined) =>
        prev ? { ...prev, ...updates } : null
      );
    },
    [queryClient]
  );

  const refetchUser = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    user: user ?? null,
    loading,
    error: error?.message ?? null,
    logout,
    refetch: refetchUser,
    updateUser,
  };
}
