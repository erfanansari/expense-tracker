import { ASSET_CATEGORY_COLORS, getAssetCategoryLabel } from '@constants/assets';
import { TrendingUp, Wallet } from 'lucide-react';

import type { AssetCategory } from '@types';

import Money from '@components/Money';

import { PIVOT_CURRENCY } from '@/constants/currencies';

import type { AssetsSummaryProps } from '../../@types';
import { CATEGORY_ICONS } from '../../constants';

const CATEGORY_COLORS = ASSET_CATEGORY_COLORS as Record<AssetCategory, string>;

const AssetsSummary = ({ totalValue, assetsByCategory }: AssetsSummaryProps) => {
  const totalAssetCount = Object.values(assetsByCategory).reduce((sum, data) => sum + data.assets.length, 0);

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
      {/* Net Worth (total across all categories) */}
      <div className="border-border-subtle bg-background relative min-w-0 rounded-xl border p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
            <TrendingUp className="text-blue h-5 w-5" />
          </div>
        </div>
        <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">Net Worth</p>
        <Money
          amount={totalValue}
          currency={PIVOT_CURRENCY}
          primaryClassName="text-text-primary text-2xl font-semibold tabular-nums"
          secondaryClassName="text-text-muted text-xs"
        />
        <p className="text-text-secondary mt-1.5 text-sm font-medium">
          {totalAssetCount} asset{totalAssetCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Every asset category, highest value first */}
      {Object.entries(assetsByCategory)
        .sort(([, a], [, b]) => b.total - a.total)
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
              <Money
                amount={data.total}
                currency={PIVOT_CURRENCY}
                primaryClassName="text-text-primary text-2xl font-semibold tabular-nums"
                secondaryClassName="text-text-muted text-xs"
              />
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
