import { ASSET_CATEGORY_COLORS, getAssetCategoryLabel } from '@constants/assets';
import { TrendingUp, Wallet } from 'lucide-react';

import type { AssetCategory } from '@types';

import { formatNumber } from '@utils';

import type { AssetsSummaryProps } from '../../@types';
import { CATEGORY_ICONS } from '../../constants';

const CATEGORY_COLORS = ASSET_CATEGORY_COLORS as Record<AssetCategory, string>;

const AssetsSummary = ({ totalValueUsd, totalValueToman, assetsByCategory }: AssetsSummaryProps) => {
  return (
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
              <p className="text-text-primary text-2xl font-semibold tabular-nums">${formatNumber(data.totalUsd)}</p>
              <p className="text-text-secondary mt-1.5 text-sm font-medium">
                {data.assets.length} asset{data.assets.length !== 1 ? 's' : ''}
              </p>
            </div>
          );
        })}
    </div>
  );
};

export default AssetsSummary;
