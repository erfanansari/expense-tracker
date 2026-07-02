'use client';

import { useCallback } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useToast } from '@components/Toast/ToastProvider';

import { fetchMe, logout as logoutApi } from '@/lib/api/auth';
import type { AuthUser } from '@/lib/api/auth';
import { beginSignout } from '@/lib/api/auth-handler';
import { queryKeys } from '@/lib/query-keys';

export function useAuth() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Queries
  const {
    data: user,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: fetchMe,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // Callbacks
  const logout = useCallback(async () => {
    // Own the signout so AuthGuard / the 401 listener don't stack a second
    // toast or redirect on top of this one.
    beginSignout();
    try {
      await logoutApi();
    } catch {
      // Even if the request fails, still redirect — /login is the safest
      // state either way, and the proxy will bounce us back if the cookie
      // somehow survived.
    }
    showToast('Signed out. See you next time!', 'info');
    // Hard navigation rather than router.push: guarantees a fresh request so
    // the proxy re-evaluates the (now-deleted) cookie server-side, and the
    // full page load wipes all in-memory state (including the query cache) —
    // no need to clear it here, which would only flash a refetch loader.
    window.location.href = '/login';
  }, [showToast]);

  const updateUser = useCallback(
    (updates: Partial<AuthUser>) => {
      queryClient.setQueryData(queryKeys.auth.me(), (prev: AuthUser | null | undefined) =>
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
