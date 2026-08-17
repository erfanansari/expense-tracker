'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { deleteAssetKeyGenerator } from '@api/deleteAssetMutation';
import type { DeleteAssetRequestData } from '@api/deleteAssetMutation';
import { ASSETS_SCOPE, getAssetListKeyGenerator } from '@api/getAssetListQuery';
import type { GetAssetListResponse } from '@api/getAssetListQuery';
import { SUMMARY_SCOPE } from '@api/getSummaryQuery';
import { ASSET_CATEGORY_COLOR_FALLBACK, ASSET_CATEGORY_COLORS } from '@constants/assets';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, RefreshCw } from 'lucide-react';

import type { Asset, AssetCategory } from '@types';

import Button from '@components/Button';
import DeleteConfirmModal from '@components/DeleteConfirmModal';
import Pulse from '@components/Skeleton';

import { useAssetCategoryLabel } from '@hooks/use-constant-labels';
import { useDeleteConfirmation } from '@hooks/use-delete-confirmation';

import { useDrawerStore } from '@stores/drawer';
import { useToast } from '@stores/toast';

import { ensureError } from '@utils';

import type { CategoryData, ChartEntry } from './@types';
import AssetsDistribution from './components/AssetsDistribution';
import AssetsSummary from './components/AssetsSummary';
import AssetsTable from './components/AssetsTable';
import NetWorthChart from './components/NetWorthChart';
import RevalueModal from './components/RevalueModal';

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
  // Customs
  const t = useTranslations('pages.assets');
  const tCommon = useTranslations('common');
  const categoryLabel = useAssetCategoryLabel();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Queries
  const {
    data: assets = [],
    isLoading,
    error,
    refetch,
  } = useQuery<GetAssetListResponse>({ queryKey: getAssetListKeyGenerator() });

  // Mutations
  const { mutateAsync: deleteAssetAsync } = useMutation<void, Error, DeleteAssetRequestData>({
    mutationKey: deleteAssetKeyGenerator(),
  });

  const openAssetDrawer = useDrawerStore((state) => state.openAssetDrawer);
  const [isRevalueOpen, setIsRevalueOpen] = useState(false);
  const {
    itemToDelete: assetToDelete,
    isModalOpen: isDeleteModalOpen,
    deletingId,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
    confirmDelete,
  } = useDeleteConfirmation<Asset>({
    onDelete: async (id) => {
      await deleteAssetAsync({ id });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ASSETS_SCOPE }),
        queryClient.invalidateQueries({ queryKey: SUMMARY_SCOPE }),
      ]);
      showToast(t('deleted'), 'info');
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
    name: categoryLabel(category),
    value: data.total,
    color: CATEGORY_COLORS[category as AssetCategory] || ASSET_CATEGORY_COLOR_FALLBACK,
  }));

  const showingSkeleton = isLoading && assets.length === 0;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1600px] px-6 py-8">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between gap-4 sm:mb-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-text-primary text-xl font-semibold sm:text-2xl md:text-3xl">{t('title')}</h1>
            <p className="text-text-muted mt-1 text-xs sm:text-sm">{t('subtitle')}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setIsRevalueOpen(true)}
              disabled={showingSkeleton || assets.length === 0}
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">{t('revalue.button')}</span>
            </Button>
            <Button variant="primary" onClick={() => openAssetDrawer()}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{tCommon('addAsset')}</span>
            </Button>
          </div>
        </div>

        {/* On a failed fetch with no cached data, the table below shows the error —
            don't render zero-state cards that read as an empty account. */}
        {showingSkeleton ? (
          <AssetsSummarySkeleton />
        ) : (
          !(error && assets.length === 0) && (
            <AssetsSummary totalValue={totalValue} assetsByCategory={assetsByCategory} />
          )
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

        {/* Always render the full page layout — sections show their own empty
            states instead of vanishing, so a fresh account never looks broken.
            Exception: a failed fetch — their empty states would be lying. */}
        {!(error && assets.length === 0) && (
          <>
            <div className="mt-6">
              <AssetsDistribution chartData={chartData} totalValue={totalValue} />
            </div>
            <div className="mt-6">
              <NetWorthChart />
            </div>
          </>
        )}

        {/* Revalue at current rates */}
        <RevalueModal isOpen={isRevalueOpen} onClose={() => setIsRevalueOpen(false)} />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          title={t('deleteTitle')}
          message={t('deleteMessage')}
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
