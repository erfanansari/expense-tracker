import { useQuery } from '@tanstack/react-query';

import { createTag, deleteTag, fetchTags, fetchTagsWithUsage, updateTag } from '@/lib/api/tags';
import { queryKeys } from '@/lib/query-keys';

import { useMutationWithInvalidation } from './use-mutation-with-invalidation';

const TAG_INVALIDATION_KEYS = [queryKeys.tags.all(), queryKeys.tags.withUsage()] as const;

export function useTags() {
  return useQuery({
    queryKey: queryKeys.tags.all(),
    queryFn: fetchTags,
  });
}

export function useTagsWithUsage() {
  return useQuery({
    queryKey: queryKeys.tags.withUsage(),
    queryFn: fetchTagsWithUsage,
  });
}

export const useCreateTag = () => useMutationWithInvalidation(createTag, TAG_INVALIDATION_KEYS);

export const useUpdateTag = () =>
  useMutationWithInvalidation(
    ({ id, name }: { id: number; name: string }) => updateTag(id, name),
    TAG_INVALIDATION_KEYS
  );

export const useDeleteTag = () =>
  useMutationWithInvalidation(deleteTag, [
    ...TAG_INVALIDATION_KEYS,
    queryKeys.expenses.all(), // Tag deletion affects expense display
  ]);
