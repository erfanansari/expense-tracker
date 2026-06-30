import { ASSET_CATEGORY_COLORS, getAssetCategoryLabel } from '@constants/assets';
import { TrendingUp, Wallet } from 'lucide-react';

import type { Asset, AssetCategory } from '@types';

import { useCurrency } from '@features/ExchangeRate/CurrencyProvider';
import type { MoneyItem } from '@features/ExchangeRate/CurrencyProvider';

import type { AssetsSummaryProps } from '../../@types';
import { CATEGORY_ICONS } from '../../constants';

const CATEGORY_COLORS = ASSET_CATEGORY_COLORS as Record<AssetCategory, string>;

// Each asset converted at its OWN valuation date — historically accurate & stable.
const toItem = (a: Asset): MoneyItem => ({
  amount: a.amount,
  currency: a.currency,
  date: a.lastValuedAt?.slice(0, 10),
});

const AssetsSummary = ({ assetsByCategory }: AssetsSummaryProps) => {
  const { primaryCurrency, secondaryCurrency, sumTo, format, formatFull } = useCurrency();
  const showSecondary = !!secondaryCurrency && secondaryCurrency !== primaryCurrency;

  const allAssets = Object.values(assetsByCategory).flatMap((d) => d.assets);
  const totalAssetCount = allAssets.length;

  const pair = (assets: Asset[]) => {
    const items = assets.map(toItem);
    return {
      p: sumTo(items, primaryCurrency),
      s: showSecondary ? sumTo(items, secondaryCurrency || primaryCurrency) : 0,
    };
  };
  const net = pair(allAssets);

  const renderPair = (p: number, s: number) => (
    <>
      <p className="text-text-primary text-2xl font-semibold tabular-nums" title={formatFull(p, primaryCurrency)}>
        {format(p, primaryCurrency, { compact: true })}
      </p>
      {showSecondary && secondaryCurrency && (
        <p className="text-text-muted text-xs" title={formatFull(s, secondaryCurrency)}>
          {format(s, secondaryCurrency, { compact: true })}
        </p>
      )}
    </>
  );

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
        {renderPair(net.p, net.s)}
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
          const cat = pair(data.assets);

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
              {renderPair(cat.p, cat.s)}
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
