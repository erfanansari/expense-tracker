'use client';

import { getMeKeyGenerator } from '@api/getMeQuery';
import { updateUserProfileKeyGenerator } from '@api/updateUserProfileMutation';
import type { UpdateUserProfileRequestData } from '@api/updateUserProfileMutation';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { AuthUser } from '@types';

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation<{ user: Pick<AuthUser, 'id' | 'email' | 'name'> }, Error, UpdateUserProfileRequestData>({
    mutationKey: updateUserProfileKeyGenerator(),
    onMutate: async ({ name }) => {
      await queryClient.cancelQueries({ queryKey: getMeKeyGenerator() });
      const previous = queryClient.getQueryData<AuthUser | null>(getMeKeyGenerator());
      queryClient.setQueryData(getMeKeyGenerator(), (prev: AuthUser | null | undefined) =>
        prev ? { ...prev, name } : null
      );
      return { previous };
    },
    onError: (_err, _data, context) => {
      const typedContext = context as { previous?: AuthUser | null } | undefined;
      if (typedContext?.previous !== undefined) {
        queryClient.setQueryData(getMeKeyGenerator(), typedContext.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: getMeKeyGenerator() });
    },
  });
}
