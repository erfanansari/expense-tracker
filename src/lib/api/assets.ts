import type { Asset, CreateAssetInput, UpdateAssetInput } from '@/@types/asset';

export async function fetchAssets(): Promise<Asset[]> {
  const response = await fetch('/api/assets');
  if (!response.ok) throw new Error('Failed to load assets');
  return response.json();
}

export async function createAsset(data: CreateAssetInput): Promise<Asset> {
  const response = await fetch('/api/assets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || 'Failed to create asset');
  return json;
}

export async function updateAsset(id: number, data: UpdateAssetInput): Promise<Asset> {
  const response = await fetch(`/api/assets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || 'Failed to update asset');
  return json;
}

export async function deleteAsset(id: number): Promise<void> {
  const response = await fetch(`/api/assets/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete asset');
}
