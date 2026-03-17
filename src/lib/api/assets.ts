import type { Asset, CreateAssetInput, UpdateAssetInput } from '@/@types/asset';

import { apiFetch, apiMutate } from './client';

export const fetchAssets = () => apiFetch<Asset[]>('/api/assets');

export const createAsset = (data: CreateAssetInput) => apiMutate<Asset>('/api/assets', 'POST', data);

export const updateAsset = (id: number, data: UpdateAssetInput) => apiMutate<Asset>(`/api/assets/${id}`, 'PUT', data);

export const deleteAsset = (id: number) => apiMutate<void>(`/api/assets/${id}`, 'DELETE');
