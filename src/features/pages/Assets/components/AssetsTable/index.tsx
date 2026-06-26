import { useMemo } from 'react';

import { ASSET_CATEGORY_COLORS, getAssetCategoryLabel } from '@constants/assets';
import { Wallet } from 'lucide-react';

import type { AssetCategory } from '@types';

import { ApiError } from '@core/errors';

import DataTable from '@components/DataTable';
import ErrorState from '@components/ErrorState';
import Pulse from '@components/Skeleton';

import type { AssetsTableProps } from '../../@types';
import { ASSETS_TABLE_MIN_WIDTH, buildAssetColumns, CATEGORY_ICONS } from '../../constants';

const CATEGORY_COLORS = ASSET_CATEGORY_COLORS as Record<AssetCategory, string>;

function AssetsTableSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="border-border-subtle bg-background rounded-xl border shadow-sm">
          <div className="bg-background-secondary border-border-subtle border-b px-6 py-4">
            <div className="flex justify-between">
              <Pulse className="h-3 w-16" />
              <Pulse className="h-3 w-16" />
              <Pulse className="h-3 w-16" />
            </div>
          </div>
          {[...Array(3)].map((_, j) => (
            <div key={j} className="border-border-subtle border-t px-6 py-4">
              <div className="flex justify-between">
                <Pulse className="h-4 w-28" />
                <Pulse className="h-4 w-16" />
                <Pulse className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const AssetsTable = ({
  assetsByCategory,
  isLoading,
  error,
  assetsCount,
  onEdit,
  onDelete,
  deletingId,
  onRetry,
}: AssetsTableProps) => {
  // Memos
  const assetColumns = useMemo(() => buildAssetColumns(onEdit, onDelete, deletingId), [onEdit, onDelete, deletingId]);

  if (isLoading) {
    return <AssetsTableSkeleton />;
  }

  if (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    return (
      <div className="border-border-subtle bg-background relative overflow-hidden rounded-xl border shadow-sm">
        <ErrorState title="Couldn't load assets" description={error.message} onRetry={onRetry} />
      </div>
    );
  }

  if (assetsCount === 0) {
    return (
      <div className="border-border-subtle bg-background relative rounded-xl border p-16 text-center shadow-sm">
        <div className="border-border-subtle bg-background-secondary mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl border">
          <Wallet className="text-text-muted h-8 w-8" />
        </div>
        <p className="text-text-secondary font-medium">No assets recorded yet</p>
        <p className="text-text-muted mt-1 text-sm">Add your first asset above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(assetsByCategory)
        .sort(([, a], [, b]) => b.total - a.total)
        .map(([category, data]) => {
          const Icon = CATEGORY_ICONS[category as AssetCategory] || Wallet;
          const labels = getAssetCategoryLabel(category);
          const color = CATEGORY_COLORS[category as AssetCategory] || '#525252';

          return (
            <div key={category}>
              <div className="mb-4 flex items-center gap-2">
                <Icon className="h-5 w-5" style={{ color }} />
                <h2 className="text-text-primary text-lg font-semibold">{labels.en}</h2>
              </div>
              <DataTable
                data={data.assets}
                columns={assetColumns}
                minWidth={ASSETS_TABLE_MIN_WIDTH}
                getRowId={(row) => String(row.id)}
              />
            </div>
          );
        })}
    </div>
  );
};

export default AssetsTable;
