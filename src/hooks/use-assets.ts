import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreateAssetInput, UpdateAssetInput } from '@/@types/asset';
import { createAsset, deleteAsset, fetchAssets, updateAsset } from '@/lib/api/assets';
import { queryKeys } from '@/lib/query-keys';

export function useAssets() {
  return useQuery({
    queryKey: queryKeys.assets.all(),
    queryFn: fetchAssets,
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.summary.all() });
    },
  });
}

export function useUpdateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAssetInput }) => updateAsset(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.summary.all() });
    },
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.summary.all() });
    },
  });
}

export type { CreateAssetInput };
