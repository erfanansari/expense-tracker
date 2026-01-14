export type AssetCategory = 'cash' | 'crypto' | 'commodity' | 'vehicle' | 'property' | 'bank' | 'investment';

export interface Asset {
  id: number;
  userId: number;
  category: AssetCategory;
  name: string;
  quantity: number;
  unit: string | null;
  unitValueUsd: number | null;
  totalValueUsd: number;
  totalValueToman: number;
  exchangeRateUsed: number;
  notes: string | null;
  lastValuedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssetInput {
  category: AssetCategory;
  name: string;
  quantity: number;
  unit?: string;
  unitValueUsd?: number;
  totalValueUsd: number;
  totalValueToman: number;
  exchangeRateUsed: number;
  notes?: string;
  lastValuedAt?: string;
}

export type UpdateAssetInput = Partial<CreateAssetInput>;

export interface AssetValuation {
  id: number;
  assetId: number;
  quantity: number;
  unitValueUsd: number | null;
  totalValueUsd: number;
  totalValueToman: number;
  exchangeRateUsed: number;
  valuedAt: string;
  createdAt: string;
}

export interface AssetSummary {
  totalValueUsd: number;
  totalValueToman: number;
  byCategory: {
    category: AssetCategory;
    valueUsd: number;
    valueToman: number;
    percentage: number;
  }[];
}
