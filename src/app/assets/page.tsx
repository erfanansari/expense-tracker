'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  Banknote,
  Bitcoin,
  Building2,
  Car,
  Edit,
  Gem,
  Landmark,
  Loader2,
  Plus,
  Trash2,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Cell, Pie, PieChart, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

import type { Asset, AssetCategory } from '@types';

import AssetForm from '@features/assets/components/AssetForm';

import Button from '@components/Button';
import DashboardLayout from '@components/DashboardLayout';
import DeleteConfirmModal from '@components/DeleteConfirmModal';
import FormDrawer from '@components/FormDrawer';
import useDrawer from '@components/FormDrawer/useDrawer';
import Loading from '@components/Loading';

import { getAssetCategoryLabel } from '@/constants/assets';
import { formatNumber } from '@/utils';

const CATEGORY_ICONS: Record<AssetCategory, typeof Wallet> = {
  cash: Banknote,
  crypto: Bitcoin,
  commodity: Gem,
  vehicle: Car,
  property: Building2,
  bank: Landmark,
  investment: TrendingUp,
};

const CATEGORY_COLORS: Record<AssetCategory, string> = {
  cash: '#10b981',
  crypto: '#f59e0b',
  commodity: '#eab308',
  vehicle: '#6366f1',
  property: '#0070f3',
  bank: '#8b5cf6',
  investment: '#ec4899',
};

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingAsset, setEditingAsset] = useState<Asset | undefined>(undefined);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { isOpen: isDrawerOpen, isDirty, openDrawer, closeDrawer, setIsDirty } = useDrawer();

  const fetchAssets = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/assets');
      if (response.ok) {
        const data = await response.json();
        setAssets(data);
      } else {
        setError('Failed to load assets');
      }
    } catch {
      setError('Failed to load assets');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openDeleteModal = (asset: Asset) => {
    setAssetToDelete(asset);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setAssetToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!assetToDelete) return;

    setDeletingId(assetToDelete.id);

    try {
      const response = await fetch(`/api/assets/${assetToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAssets(assets.filter((a) => a.id !== assetToDelete.id));
        closeDeleteModal();
      } else {
        alert('Failed to delete asset');
      }
    } catch {
      alert('Failed to delete asset');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAssetChange = useCallback(() => {
    fetchAssets();
    setEditingAsset(undefined);
    closeDrawer();
  }, [fetchAssets, closeDrawer]);

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

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

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

  // Custom tooltip for pie chart
  const CustomChartTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ value: number; payload: { name: string; nameFa: string; tomanValue: number } }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="border-border-subtle bg-background rounded-lg border p-4 shadow-lg">
          <p className="text-text-primary text-lg font-bold" dir="rtl">
            {formatNumber(data.payload.tomanValue)} تومان
          </p>
          <p className="text-text-muted mt-1.5 text-sm font-medium">${formatNumber(data.value)} USD</p>
          <p className="text-blue mt-2 text-sm font-medium" dir="rtl">
            {data.payload.nameFa}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div className="bg-background min-h-screen">
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
              <p className="text-text-secondary mt-1.5 text-sm font-medium" dir="rtl">
                {formatNumber(totalValueToman)} تومان
              </p>
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
            if (isLoading && assets.length === 0) {
              return <Loading message="Loading assets..." />;
            }
            if (error && assets.length === 0) {
              return (
                <div className="border-border-subtle bg-background relative rounded-xl border p-16 text-center shadow-sm">
                  <div className="border-danger bg-danger-light mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl border">
                    <Wallet className="text-danger h-8 w-8" />
                  </div>
                  <p className="text-danger font-medium">{error}</p>
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
              <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
                {/* Asset List */}
                <div className="space-y-6 lg:col-span-2">
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
                            <span className="text-text-muted text-sm" dir="rtl">
                              {labels.fa}
                            </span>
                          </div>
                          <div className="border-border-subtle bg-background relative overflow-hidden rounded-xl border shadow-sm">
                            <div className="overflow-x-auto">
                              <table className="w-full min-w-[500px] border-collapse">
                                <thead>
                                  <tr className="bg-background-secondary">
                                    <th className="text-text-muted min-w-[120px] px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase sm:px-6 sm:py-4">
                                      Asset
                                    </th>
                                    <th className="text-text-muted min-w-[100px] px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase sm:px-6 sm:py-4">
                                      Quantity
                                    </th>
                                    <th className="text-text-muted min-w-[120px] px-4 py-3 text-right text-xs font-semibold tracking-wider uppercase sm:px-6 sm:py-4">
                                      Value
                                    </th>
                                    <th className="text-text-muted min-w-[80px] px-4 py-3 text-center text-xs font-semibold tracking-wider uppercase sm:px-6 sm:py-4">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {data.assets.map((asset) => (
                                    <tr
                                      key={asset.id}
                                      className="group border-border-subtle hover:bg-background-elevated border-t transition-colors duration-200 first:border-t-0"
                                    >
                                      <td className="px-4 py-3 sm:px-6 sm:py-4">
                                        <div className="flex flex-col">
                                          <span className="text-text-primary text-sm font-medium">{asset.name}</span>
                                          <span className="text-text-muted text-xs">
                                            {getAssetCategoryLabel(asset.category).en}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 sm:px-6 sm:py-4">
                                        <span className="text-text-secondary text-sm">
                                          {asset.quantity} {asset.unit || 'unit'}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 text-right sm:px-6 sm:py-4">
                                        <div className="flex flex-col items-end">
                                          <span className="text-text-primary text-sm font-semibold">
                                            ${formatNumber(asset.totalValueUsd)}
                                          </span>
                                          <span className="text-text-muted text-xs" dir="rtl">
                                            {formatNumber(asset.totalValueToman)} ت
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 sm:px-6 sm:py-4">
                                        <div className="flex items-center justify-center gap-1">
                                          <button
                                            onClick={() => handleEdit(asset)}
                                            className="text-text-muted hover:bg-blue/10 hover:text-blue rounded-lg p-2 transition-all duration-200"
                                            title="Update Value"
                                          >
                                            <Edit className="h-4 w-4" />
                                          </button>
                                          <button
                                            onClick={() => openDeleteModal(asset)}
                                            disabled={deletingId === asset.id}
                                            className="text-text-muted hover:bg-danger/10 hover:text-danger rounded-lg p-2 transition-all duration-200 disabled:opacity-50"
                                            title="Delete"
                                          >
                                            {deletingId === asset.id ? (
                                              <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                              <Trash2 className="h-4 w-4" />
                                            )}
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Distribution Chart */}
                <div className="lg:col-span-1">
                  <div className="border-border-subtle bg-background sticky top-24 rounded-xl border p-6 shadow-sm">
                    <h3 className="text-text-primary mb-4 text-lg font-semibold">Asset Distribution</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip content={<CustomChartTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Legend */}
                    <div className="mt-4 space-y-2">
                      {chartData.map((entry) => (
                        <div key={entry.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-text-secondary text-sm">{entry.name}</span>
                          </div>
                          <span className="text-text-primary text-sm font-medium">
                            {totalValueUsd > 0 ? ((entry.value / totalValueUsd) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

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
          titleFa={editingAsset ? 'ویرایش دارایی' : 'افزودن دارایی جدید'}
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
    </DashboardLayout>
  );
}
