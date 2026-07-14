import type { Asset } from '@types';

// Totals are in the pivot currency (amount * entryRate). The Money component
// converts to the user's primary/secondary currency for display.
export interface CategoryData {
  assets: Asset[];
  total: number;
}

export interface ChartEntry {
  name: string;
  value: number;
  color: string;
}

export interface AssetsSummaryProps {
  totalValue: number;
  assetsByCategory: Record<string, CategoryData>;
}

export interface AssetsTableProps {
  assetsByCategory: Record<string, CategoryData>;
  isLoading: boolean;
  error: Error | null;
  assetsCount: number;
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
  deletingId: number | null;
  onRetry: () => void;
}

export interface AssetsDistributionProps {
  chartData: ChartEntry[];
  totalValue: number;
}
