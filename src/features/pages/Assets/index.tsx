'use client';

import { ASSET_CATEGORY_COLORS, getAssetCategoryLabel } from '@constants/assets';
import { Plus } from 'lucide-react';

import type { Asset, AssetCategory } from '@types';

import { useGlobalDrawer } from '@features/drawers/GlobalDrawerProvider';

import Button from '@components/Button';
import DeleteConfirmModal from '@components/DeleteConfirmModal';
import Pulse from '@components/Skeleton';
import { useToast } from '@components/Toast/ToastProvider';

import { useAssets, useDeleteAsset } from '@hooks/use-assets';
import { useDeleteConfirmation } from '@hooks/use-delete-confirmation';

import { ensureError } from '@utils';

import type { CategoryData, ChartEntry } from './@types';
import AssetsDistribution from './components/AssetsDistribution';
import AssetsSummary from './components/AssetsSummary';
import AssetsTable from './components/AssetsTable';
import NetWorthChart from './components/NetWorthChart';

const CATEGORY_COLORS = ASSET_CATEGORY_COLORS as Record<AssetCategory, string>;

function AssetsSummarySkeleton() {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="border-border-subtle bg-background rounded-xl border p-5 shadow-sm">
          <Pulse className="mb-4 h-9 w-9 rounded-lg" />
          <Pulse className="mb-2 h-3 w-20" />
          <Pulse className="mb-2 h-7 w-3/4" />
          <Pulse className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

const AssetsPage = () => {
  // Queries
  const { data: assets = [], isLoading, error, refetch } = useAssets();
  const deleteAsset = useDeleteAsset();

  // Customs
  const { showToast } = useToast();
  const { openAssetDrawer } = useGlobalDrawer();
  const {
    itemToDelete: assetToDelete,
    isModalOpen: isDeleteModalOpen,
    deletingId,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
    confirmDelete,
  } = useDeleteConfirmation<Asset>({
    onDelete: async (id) => {
      await deleteAsset.mutateAsync(id);
      showToast('Asset deleted.', 'info');
    },
    onError: (err) => showToast(ensureError(err).message, 'error'),
  });

  // Totals in the pivot currency (amount * entryRate); Money converts for display.
  const totalValue = assets.reduce((sum, a) => sum + a.amount * a.entryRate, 0);

  const assetsByCategory = assets.reduce(
    (acc, asset) => {
      const category = asset.category || 'other';
      if (!acc[category]) {
        acc[category] = { assets: [], total: 0 };
      }
      acc[category].assets.push(asset);
      acc[category].total += asset.amount * asset.entryRate;
      return acc;
    },
    {} as Record<string, CategoryData>
  );

  const chartData: ChartEntry[] = Object.entries(assetsByCategory).map(([category, data]) => ({
    name: getAssetCategoryLabel(category).en,
    nameFa: getAssetCategoryLabel(category).fa,
    value: data.total,
    color: CATEGORY_COLORS[category as AssetCategory] || '#525252',
  }));

  const showingSkeleton = isLoading && assets.length === 0;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1600px] px-6 py-8">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between gap-4 sm:mb-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-text-primary text-xl font-semibold sm:text-2xl md:text-3xl">Assets</h1>
            <p className="text-text-muted mt-1 text-xs sm:text-sm">Track your wealth portfolio</p>
          </div>
          <Button variant="primary" onClick={() => openAssetDrawer()} className="shrink-0">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Asset</span>
          </Button>
        </div>

        {showingSkeleton ? (
          <AssetsSummarySkeleton />
        ) : (
          <AssetsSummary totalValue={totalValue} assetsByCategory={assetsByCategory} />
        )}

        <AssetsTable
          assetsByCategory={assetsByCategory}
          isLoading={showingSkeleton}
          error={error}
          assetsCount={assets.length}
          onEdit={openAssetDrawer}
          onDelete={openDeleteModal}
          deletingId={deletingId}
          onRetry={() => refetch()}
        />

        {assets.length > 0 && (
          <>
            <div className="mt-6">
              <AssetsDistribution chartData={chartData} totalValue={totalValue} />
            </div>
            <div className="mt-6">
              <NetWorthChart />
            </div>
          </>
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          title="Delete asset"
          message="Are you sure you want to delete this asset? All valuation history will be removed."
          itemName={assetToDelete?.name}
          onConfirm={confirmDelete}
          onCancel={closeDeleteModal}
          isDeleting={deletingId === assetToDelete?.id}
        />
      </div>
    </div>
  );
};

export default AssetsPage;
