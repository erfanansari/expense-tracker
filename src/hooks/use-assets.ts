import { useQuery } from '@tanstack/react-query';

import type { CreateAssetInput, UpdateAssetInput } from '@/@types/asset';
import { createAsset, deleteAsset, fetchAssets, updateAsset } from '@/lib/api/assets';
import { queryKeys } from '@/lib/query-keys';

import { useMutationWithInvalidation } from './use-mutation-with-invalidation';

const ASSET_INVALIDATION_KEYS = [queryKeys.assets.all(), queryKeys.summary.all()] as const;

export function useAssets() {
  return useQuery({
    queryKey: queryKeys.assets.all(),
    queryFn: fetchAssets,
  });
}

export const useCreateAsset = () => useMutationWithInvalidation(createAsset, ASSET_INVALIDATION_KEYS);

export const useUpdateAsset = () =>
  useMutationWithInvalidation(
    ({ id, data }: { id: number; data: UpdateAssetInput }) => updateAsset(id, data),
    ASSET_INVALIDATION_KEYS
  );

export const useDeleteAsset = () => useMutationWithInvalidation(deleteAsset, ASSET_INVALIDATION_KEYS);

export type { CreateAssetInput };
