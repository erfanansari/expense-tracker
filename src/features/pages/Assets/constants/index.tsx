import { getAssetCategoryLabel } from '@constants/assets';
import { type ColumnDef } from '@tanstack/react-table';
import { Banknote, Bitcoin, Building2, Gem, Landmark, TrendingUp, Wallet } from 'lucide-react';

import type { Asset, AssetCategory } from '@types';

import ActionButtons from '@components/ActionButtons';
import Money from '@components/Money';

export const CATEGORY_ICONS: Record<AssetCategory, typeof Wallet> = {
  cash: Banknote,
  crypto: Bitcoin,
  commodity: Gem,
  vehicle: Wallet,
  property: Building2,
  bank: Landmark,
  investment: TrendingUp,
};

// ─── Table layout config ──────────────────────────────────────────────────────
// Centralized so column widths can be tuned in one place. Percentages must sum
// to 100; `ASSETS_TABLE_MIN_WIDTH` is the smallest width the table is allowed
// to shrink to before triggering horizontal scroll on narrow viewports.

export const ASSETS_TABLE_MIN_WIDTH = 'min-w-[680px]';

export const ASSETS_COLUMN_WIDTHS = {
  name: 'w-[35%]',
  quantity: 'w-[18%]',
  value: 'w-[32%]',
  actions: 'w-[15%]',
} as const;

// ─── Column definitions ───────────────────────────────────────────────────────

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
      meta: { widthClass: ASSETS_COLUMN_WIDTHS.name },
      cell: ({ row }) => {
        const asset = row.original;
        return (
          <div className="flex min-w-0 flex-col">
            <span className="text-text-primary truncate text-sm font-medium">{asset.name}</span>
            <span className="text-text-muted truncate text-xs">{getAssetCategoryLabel(asset.category).en}</span>
          </div>
        );
      },
    },
    {
      id: 'quantity',
      accessorKey: 'quantity',
      header: 'Quantity',
      meta: { widthClass: ASSETS_COLUMN_WIDTHS.quantity },
      cell: ({ row }) => {
        const asset = row.original;
        return (
          <span className="text-text-secondary block truncate text-sm whitespace-nowrap">
            {asset.quantity} {asset.unit || 'unit'}
          </span>
        );
      },
    },
    {
      id: 'value',
      accessorKey: 'amount',
      header: 'Value',
      meta: { widthClass: ASSETS_COLUMN_WIDTHS.value, align: 'right' as const },
      cell: ({ row }) => {
        const asset = row.original;
        return (
          <Money
            amount={asset.amount}
            currency={asset.currency}
            date={asset.lastValuedAt?.slice(0, 10)}
            className="items-end"
            primaryClassName="text-text-primary text-sm font-semibold whitespace-nowrap"
            secondaryClassName="text-text-muted text-xs whitespace-nowrap"
          />
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      meta: { widthClass: ASSETS_COLUMN_WIDTHS.actions, align: 'center' as const },
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
