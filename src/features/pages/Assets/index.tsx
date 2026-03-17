'use client';

import { useCallback, useMemo, useState } from 'react';

import { ASSET_CATEGORY_COLORS, getAssetCategoryLabel } from '@constants/assets';
import { type ColumnDef } from '@tanstack/react-table';
import {
  Banknote,
  Bitcoin,
  Building2,
  Edit2,
  Gem,
  Landmark,
  Loader2,
  Plus,
  Trash2,
  TrendingUp,
  Wallet,
} from 'lucide-react';

import type { Asset, AssetCategory } from '@types';

import AssetForm from '@features/assets/components/AssetForm';

import Button from '@components/Button';
import DataTable from '@components/DataTable';
import DeleteConfirmModal from '@components/DeleteConfirmModal';
import FormDrawer from '@components/FormDrawer';
import useDrawer from '@components/FormDrawer/useDrawer';
import Pulse from '@components/Skeleton';
import { useToast } from '@components/Toast/ToastProvider';

import { useAssets, useDeleteAsset } from '@hooks/use-assets';
import { useDeleteConfirmation } from '@hooks/use-delete-confirmation';

import { formatNumber } from '@utils';

const CATEGORY_ICONS: Record<AssetCategory, typeof Wallet> = {
  cash: Banknote,
  crypto: Bitcoin,
  commodity: Gem,
  vehicle: Wallet,
  property: Building2,
  bank: Landmark,
  investment: TrendingUp,
};

const CATEGORY_COLORS = ASSET_CATEGORY_COLORS as Record<AssetCategory, string>;

function AssetsSkeleton() {
  return (
    <>
      {/* Summary cards */}
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

      {/* Asset list */}
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

      {/* Distribution chart */}
      <div className="border-border-subtle bg-background rounded-xl border p-6 shadow-sm">
        <Pulse className="mb-5 h-5 w-36" />
        <Pulse className="mb-6 h-3 w-full rounded-full" />
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Pulse className="h-2.5 w-2.5 shrink-0 rounded-full" />
              <div className="flex flex-col gap-1">
                <Pulse className="h-3 w-20" />
                <Pulse className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function buildAssetColumns(
  handleEdit: (asset: Asset) => void,
  openDeleteModal: (asset: Asset) => void,
  deletingId: number | null
): ColumnDef<Asset, unknown>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Asset',
      meta: { widthClass: 'w-[40%]' },
      cell: ({ row }) => {
        const asset = row.original;
        return (
          <div className="flex flex-col">
            <span className="text-text-primary text-sm font-medium">{asset.name}</span>
            <span className="text-text-muted text-xs">{getAssetCategoryLabel(asset.category).en}</span>
          </div>
        );
      },
    },
    {
      id: 'quantity',
      accessorKey: 'quantity',
      header: 'Quantity',
      meta: { widthClass: 'w-[20%]' },
      cell: ({ row }) => {
        const asset = row.original;
        return (
          <span className="text-text-secondary text-sm">
            {asset.quantity} {asset.unit || 'unit'}
          </span>
        );
      },
    },
    {
      id: 'value',
      accessorKey: 'totalValueUsd',
      header: 'Value',
      meta: { widthClass: 'w-[25%]', align: 'right' as const },
      cell: ({ row }) => {
        const asset = row.original;
        return (
          <div className="flex flex-col items-end">
            <span className="text-text-primary text-sm font-semibold">${formatNumber(asset.totalValueUsd)}</span>
            <span className="text-text-muted text-xs">{formatNumber(asset.totalValueToman)} Toman</span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      meta: { widthClass: 'w-[15%]', align: 'center' as const },
      cell: ({ row }) => {
        const asset = row.original;
        return (
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(asset);
              }}
              className="text-text-muted hover:bg-blue/10 hover:text-blue rounded-lg p-2 transition-all duration-200"
              title="Update Value"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openDeleteModal(asset);
              }}
              disabled={deletingId === asset.id}
              className="text-text-muted hover:bg-danger/10 hover:text-danger rounded-lg p-2 transition-all duration-200 disabled:opacity-50"
              title="Delete"
            >
              {deletingId === asset.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </button>
          </div>
        );
      },
    },
  ];
}

export default function AssetsPage() {
  const { data: assets = [], isLoading, error } = useAssets();
  const deleteAsset = useDeleteAsset();
  const { showToast } = useToast();

  const [editingAsset, setEditingAsset] = useState<Asset | undefined>(undefined);
  const { isOpen: isDrawerOpen, isDirty, openDrawer, closeDrawer, setIsDirty } = useDrawer();

  const {
    itemToDelete: assetToDelete,
    isModalOpen: isDeleteModalOpen,
    deletingId,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
    confirmDelete,
  } = useDeleteConfirmation<Asset>({
    onDelete: (id) => deleteAsset.mutateAsync(id),
    onError: (err) => showToast(err instanceof Error ? err.message : 'Failed to delete asset', 'error'),
  });

  const handleAssetChange = useCallback(() => {
    setEditingAsset(undefined);
    closeDrawer();
  }, [closeDrawer]);

  const handleEdit = useCallback(
    (asset: Asset) => {
      setEditingAsset(asset);
      openDrawer();
    },
    [openDrawer]
  );

  const handleAddAsset = useCallback(() => {
    setEditingAsset(undefined);
    openDrawer();
  }, [openDrawer]);

  const assetColumns = useMemo(
    () => buildAssetColumns(handleEdit, openDeleteModal, deletingId),
    [handleEdit, openDeleteModal, deletingId]
  );

  // Calculate totals
  const totalValueUsd = assets.reduce((sum, a) => sum + a.totalValueUsd, 0);
  const totalValueToman = assets.reduce((sum, a) => sum + a.totalValueToman, 0);

  // Group by category
  const assetsByCategory = assets.reduce(
    (acc, asset) => {
      const category = asset.category || 'other';
      if (!acc[category]) {
        acc[category] = { assets: [], totalUsd: 0, totalToman: 0 };
      }
      acc[category].assets.push(asset);
      acc[category].totalUsd += asset.totalValueUsd;
      acc[category].totalToman += asset.totalValueToman;
      return acc;
    },
    {} as Record<string, { assets: Asset[]; totalUsd: number; totalToman: number }>
  );

  // Prepare chart data
  const chartData = Object.entries(assetsByCategory).map(([category, data]) => ({
    name: getAssetCategoryLabel(category).en,
    nameFa: getAssetCategoryLabel(category).fa,
    value: data.totalUsd,
    tomanValue: data.totalToman,
    color: CATEGORY_COLORS[category as AssetCategory] || '#525252',
  }));

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1600px] px-6 py-8">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between gap-4 sm:mb-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-text-primary text-xl font-bold sm:text-2xl md:text-3xl">Assets</h1>
            <p className="text-text-muted mt-1 text-xs sm:text-sm">Track your wealth portfolio</p>
          </div>
          <Button variant="primary" onClick={handleAddAsset} className="shrink-0">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Asset</span>
          </Button>
        </div>

        {isLoading && assets.length === 0 ? (
          <AssetsSkeleton />
        ) : (
          <>
            {/* Summary Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
              {/* Total Value */}
              <div className="border-border-subtle bg-background relative min-w-0 rounded-xl border p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
                    <TrendingUp className="text-blue h-5 w-5" />
                  </div>
                </div>
                <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">Net Worth</p>
                <p className="text-text-primary text-2xl font-semibold tabular-nums">${formatNumber(totalValueUsd)}</p>
                <p className="text-text-secondary mt-1.5 text-sm font-medium">{formatNumber(totalValueToman)} Toman</p>
              </div>

              {/* Top 3 Categories */}
              {Object.entries(assetsByCategory)
                .sort(([, a], [, b]) => b.totalUsd - a.totalUsd)
                .slice(0, 3)
                .map(([category, data]) => {
                  const Icon = CATEGORY_ICONS[category as AssetCategory] || Wallet;
                  const labels = getAssetCategoryLabel(category);
                  const color = CATEGORY_COLORS[category as AssetCategory] || '#525252';

                  return (
                    <div
                      key={category}
                      className="border-border-subtle bg-background relative min-w-0 rounded-xl border p-5 shadow-sm"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
                          <Icon className="h-5 w-5" style={{ color }} />
                        </div>
                      </div>
                      <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">{labels.en}</p>
                      <p className="text-text-primary text-2xl font-semibold tabular-nums">
                        ${formatNumber(data.totalUsd)}
                      </p>
                      <p className="text-text-secondary mt-1.5 text-sm font-medium">
                        {data.assets.length} asset{data.assets.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  );
                })}
            </div>

            {/* Main Content */}
            {(() => {
              if (error && assets.length === 0) {
                return (
                  <div className="border-border-subtle bg-background relative rounded-xl border p-16 text-center shadow-sm">
                    <div className="border-danger bg-danger-light mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl border">
                      <Wallet className="text-danger h-8 w-8" />
                    </div>
                    <p className="text-danger font-medium">{error.message}</p>
                  </div>
                );
              }
              if (assets.length === 0) {
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
                  {/* Asset List */}
                  <div className="space-y-6">
                    {Object.entries(assetsByCategory)
                      .sort(([, a], [, b]) => b.totalUsd - a.totalUsd)
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
                              minWidth="min-w-[480px]"
                              getRowId={(row) => String(row.id)}
                            />
                          </div>
                        );
                      })}
                  </div>

                  {/* Distribution Chart */}
                  <div className="border-border-subtle bg-background rounded-xl border p-6 shadow-sm">
                    <h3 className="text-text-primary mb-5 text-lg font-semibold">Asset Distribution</h3>

                    {/* Stacked bar */}
                    <div className="mb-6 flex h-3 w-full overflow-hidden rounded-full">
                      {[...chartData]
                        .sort((a, b) => b.value - a.value)
                        .map((entry) => {
                          const pct = totalValueUsd > 0 ? (entry.value / totalValueUsd) * 100 : 0;
                          return (
                            <div
                              key={entry.name}
                              className="h-full"
                              style={{ width: `${pct}%`, backgroundColor: entry.color }}
                              title={`${entry.name}: ${pct.toFixed(1)}%`}
                            />
                          );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                      {[...chartData]
                        .sort((a, b) => b.value - a.value)
                        .map((entry) => {
                          const pct = totalValueUsd > 0 ? (entry.value / totalValueUsd) * 100 : 0;
                          return (
                            <div key={entry.name} className="flex min-w-0 items-center gap-2">
                              <div
                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <div className="min-w-0">
                                <p className="text-text-secondary truncate text-sm">{entry.name}</p>
                                <p className="text-text-muted text-xs tabular-nums">
                                  {pct.toFixed(1)}% · ${formatNumber(entry.value)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              );
            })()}
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

      {/* Asset Form Drawer */}
      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        title={editingAsset ? 'Edit Asset' : 'Add New Asset'}
        isDirty={isDirty}
      >
        <AssetForm
          onAssetAdded={handleAssetChange}
          editingAsset={editingAsset}
          onCancelEdit={closeDrawer}
          setIsDirty={setIsDirty}
        />
      </FormDrawer>
    </div>
  );
}
