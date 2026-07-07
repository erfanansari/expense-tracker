import type { Asset } from '@types';

export interface AssetFormProps {
  onAssetAdded: () => void;
  editingAsset?: Asset;
  onCancelEdit?: () => void;
  setIsDirty?: (dirty: boolean) => void;
}
