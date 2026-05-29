import type { Asset } from '@types';

export interface CategoryData {
  assets: Asset[];
  totalUsd: number;
  totalToman: number;
}

export interface ChartEntry {
  name: string;
  nameFa: string;
  value: number;
  tomanValue: number;
  color: string;
}

export interface AssetsSummaryProps {
  totalValueUsd: number;
  totalValueToman: number;
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
  totalValueUsd: number;
}
