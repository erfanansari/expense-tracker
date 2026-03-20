import { getAssetCategoryLabel } from '@constants/assets';
import { type ColumnDef } from '@tanstack/react-table';
import { Banknote, Bitcoin, Building2, Gem, Landmark, TrendingUp, Wallet } from 'lucide-react';

import type { Asset, AssetCategory } from '@types';

import ActionButtons from '@components/ActionButtons';

import { formatNumber } from '@utils';

export const CATEGORY_ICONS: Record<AssetCategory, typeof Wallet> = {
  cash: Banknote,
  crypto: Bitcoin,
  commodity: Gem,
  vehicle: Wallet,
  property: Building2,
  bank: Landmark,
  investment: TrendingUp,
};

export function buildAssetColumns(
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
          <ActionButtons
            onEdit={() => handleEdit(asset)}
            onDelete={() => openDeleteModal(asset)}
            isDeleting={deletingId === asset.id}
            editTitle="Update Value"
          />
        );
      },
    },
  ];
}
