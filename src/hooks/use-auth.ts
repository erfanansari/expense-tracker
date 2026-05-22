'use client';

import { useCallback } from 'react';

import { useRouter } from 'next/navigation';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useToast } from '@components/Toast/ToastProvider';

import { fetchMe, logout as logoutApi } from '@/lib/api/auth';
import type { AuthUser } from '@/lib/api/auth';
import { suppressNextSignoutToast } from '@/lib/api/auth-handler';
import { queryKeys } from '@/lib/query-keys';

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();
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
    try {
      await logoutApi();
      // Intentional signout — don't let AuthGuard fire its "signed out" toast
      // on top of our success toast.
      suppressNextSignoutToast();
      queryClient.clear();
      showToast('Signed out. See you next time!', 'info');
      router.push('/login');
    } catch {
      // ignore logout errors
    }
  }, [queryClient, router, showToast]);

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
