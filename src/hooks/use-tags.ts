import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createTag, deleteTag, fetchTags, fetchTagsWithUsage, updateTag } from '@/lib/api/tags';
import { queryKeys } from '@/lib/query-keys';

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

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.withUsage() });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => updateTag(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.withUsage() });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.withUsage() });
      // Tag deletion affects expense display (tags removed from expenses)
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all() });
    },
  });
}
