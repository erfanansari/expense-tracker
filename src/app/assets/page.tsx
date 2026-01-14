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
  X,
} from 'lucide-react';
import { Cell, Pie, PieChart, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

import type { Asset, AssetCategory } from '@types';

import AssetForm from '@features/assets/components/AssetForm';

import Button from '@components/Button';
import DashboardLayout from '@components/DashboardLayout';
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
  const [showForm, setShowForm] = useState(false);

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

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this asset?')) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(`/api/assets/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAssets(assets.filter((a) => a.id !== id));
      } else {
        alert('Failed to delete asset');
      }
    } catch {
      alert('Failed to delete asset');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAssetChange = () => {
    fetchAssets();
    setEditingAsset(undefined);
    setShowForm(false);
  };

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingAsset(undefined);
    setShowForm(false);
  };

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
        <div className="rounded-lg border border-[#e5e5e5] bg-white p-4 shadow-lg">
          <p className="text-lg font-bold text-[#171717]" dir="rtl">
            {formatNumber(data.payload.tomanValue)} تومان
          </p>
          <p className="mt-1.5 text-sm font-medium text-[#a3a3a3]">${formatNumber(data.value)} USD</p>
          <p className="mt-2 text-sm font-medium text-[#0070f3]" dir="rtl">
            {data.payload.nameFa}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#ffffff]">
        <div className="mx-auto max-w-[1600px] px-6 py-8">
          {/* Page Header */}
          <div className="mb-6 flex items-center justify-between gap-4 sm:mb-8">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-[#171717] sm:text-2xl md:text-3xl">Assets</h1>
              <p className="mt-1 text-xs text-[#a3a3a3] sm:text-sm">Track your wealth portfolio</p>
            </div>
            {showForm ? (
              <Button variant="outline" onClick={handleCancelEdit} className="shrink-0">
                <X className="h-4 w-4" />
                <span className="hidden sm:inline">Cancel</span>
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => {
                  setShowForm(true);
                  setEditingAsset(undefined);
                }}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Asset</span>
              </Button>
            )}
          </div>

          {/* Summary Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {/* Total Value */}
            <div className="relative min-w-0 rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-2.5">
                  <TrendingUp className="h-5 w-5 text-[#0070f3]" />
                </div>
              </div>
              <p className="mb-2 text-xs font-medium tracking-wider text-[#a3a3a3] uppercase">Net Worth</p>
              <p className="text-2xl font-semibold text-[#171717] tabular-nums">${formatNumber(totalValueUsd)}</p>
              <p className="mt-1.5 text-sm font-medium text-[#525252]" dir="rtl">
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
                    className="relative min-w-0 rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-2.5">
                        <Icon className="h-5 w-5" style={{ color }} />
                      </div>
                    </div>
                    <p className="mb-2 text-xs font-medium tracking-wider text-[#a3a3a3] uppercase">{labels.en}</p>
                    <p className="text-2xl font-semibold text-[#171717] tabular-nums">${formatNumber(data.totalUsd)}</p>
                    <p className="mt-1.5 text-sm font-medium text-[#525252]">
                      {data.assets.length} asset{data.assets.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                );
              })}
          </div>

          {/* Asset Form */}
          {showForm && (
            <div className="animate-in slide-in-from-top-4 mb-6 duration-300">
              <AssetForm onAssetAdded={handleAssetChange} editingAsset={editingAsset} onCancelEdit={handleCancelEdit} />
            </div>
          )}

          {/* Main Content */}
          {(() => {
            if (isLoading && assets.length === 0) {
              return <Loading message="Loading assets..." />;
            }
            if (error && assets.length === 0) {
              return (
                <div className="relative rounded-xl border border-[#e5e5e5] bg-white p-16 text-center shadow-sm">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl border border-[#ef4444] bg-[#fef2f2]">
                    <Wallet className="h-8 w-8 text-[#ef4444]" />
                  </div>
                  <p className="font-medium text-[#ef4444]">{error}</p>
                </div>
              );
            }
            if (assets.length === 0) {
              return (
                <div className="relative rounded-xl border border-[#e5e5e5] bg-white p-16 text-center shadow-sm">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl border border-[#e5e5e5] bg-[#fafafa]">
                    <Wallet className="h-8 w-8 text-[#a3a3a3]" />
                  </div>
                  <p className="font-medium text-[#525252]">No assets recorded yet</p>
                  <p className="mt-1 text-sm text-[#a3a3a3]">Add your first asset above!</p>
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
                            <h2 className="text-lg font-semibold text-[#171717]">{labels.en}</h2>
                            <span className="text-sm text-[#a3a3a3]" dir="rtl">
                              {labels.fa}
                            </span>
                          </div>
                          <div className="relative overflow-hidden rounded-xl border border-[#e5e5e5] bg-white shadow-sm">
                            <div className="overflow-x-auto">
                              <table className="w-full table-fixed border-collapse">
                                <thead>
                                  <tr className="bg-[#fafafa]">
                                    <th className="w-[35%] px-6 py-4 text-left text-xs font-semibold tracking-wider text-[#a3a3a3] uppercase">
                                      Asset
                                    </th>
                                    <th className="w-[25%] px-6 py-4 text-left text-xs font-semibold tracking-wider text-[#a3a3a3] uppercase">
                                      Quantity
                                    </th>
                                    <th className="w-[25%] px-6 py-4 text-right text-xs font-semibold tracking-wider text-[#a3a3a3] uppercase">
                                      Value
                                    </th>
                                    <th className="w-[15%] px-6 py-4 text-center text-xs font-semibold tracking-wider text-[#a3a3a3] uppercase">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {data.assets.map((asset) => (
                                    <tr
                                      key={asset.id}
                                      className="group border-t border-[#e5e5e5] transition-colors duration-200 first:border-t-0 hover:bg-[#f5f5f5]"
                                    >
                                      <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                          <span className="text-sm font-medium text-[#171717]">{asset.name}</span>
                                          <span className="text-xs text-[#a3a3a3]">
                                            {getAssetCategoryLabel(asset.category).en}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4">
                                        <span className="text-sm text-[#525252]">
                                          {asset.quantity} {asset.unit || 'unit'}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                        <div className="flex flex-col items-end">
                                          <span className="text-sm font-semibold text-[#171717]">
                                            ${formatNumber(asset.totalValueUsd)}
                                          </span>
                                          <span className="text-xs text-[#a3a3a3]" dir="rtl">
                                            {formatNumber(asset.totalValueToman)} ت
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-1">
                                          <button
                                            onClick={() => handleEdit(asset)}
                                            className="rounded-lg p-2 text-[#a3a3a3] transition-all duration-200 hover:bg-[#0070f3]/10 hover:text-[#0070f3]"
                                            title="Update Value"
                                          >
                                            <Edit className="h-4 w-4" />
                                          </button>
                                          <button
                                            onClick={() => handleDelete(asset.id)}
                                            disabled={deletingId === asset.id}
                                            className="rounded-lg p-2 text-[#a3a3a3] transition-all duration-200 hover:bg-[#ef4444]/10 hover:text-[#ef4444] disabled:opacity-50"
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
                  <div className="sticky top-24 rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-[#171717]">Asset Distribution</h3>
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
                            <span className="text-sm text-[#525252]">{entry.name}</span>
                          </div>
                          <span className="text-sm font-medium text-[#171717]">
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
        </div>
      </div>
    </DashboardLayout>
  );
}
