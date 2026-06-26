export type AssetCategory = 'cash' | 'crypto' | 'commodity' | 'vehicle' | 'property' | 'bank' | 'investment';

export interface Asset {
  id: number;
  userId: number;
  category: AssetCategory;
  name: string;
  quantity: number;
  unit: string | null;
  /** Per-unit value in the entry currency (nullable). */
  unitValue: number | null;
  /** Total value in the entry currency. */
  amount: number;
  /** Entry currency code (see src/constants/currencies.ts). */
  currency: string;
  /** Rate to the pivot at entry time (frozen snapshot). */
  entryRate: number;
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
  unitValue?: number;
  amount: number;
  currency: string;
  notes?: string;
  lastValuedAt?: string;
}

export type UpdateAssetInput = Partial<CreateAssetInput>;

export interface AssetValuation {
  id: number;
  assetId: number;
  quantity: number;
  unitValue: number | null;
  amount: number;
  currency: string;
  entryRate: number;
  valuedAt: string;
  createdAt: string;
}

export interface AssetSummary {
  /** Total in the pivot currency. */
  totalValue: number;
  byCategory: {
    category: AssetCategory;
    value: number;
    percentage: number;
  }[];
}
