'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { AuthUser } from '@/lib/api/auth';
import { updateUserProfile } from '@/lib/api/user';
import { queryKeys } from '@/lib/query-keys';

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onMutate: async (name: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.auth.me() });
      const previous = queryClient.getQueryData<AuthUser | null>(queryKeys.auth.me());
      queryClient.setQueryData(queryKeys.auth.me(), (prev: AuthUser | null | undefined) =>
        prev ? { ...prev, name } : null
      );
      return { previous };
    },
    onError: (_err, _name, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(queryKeys.auth.me(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });
}
