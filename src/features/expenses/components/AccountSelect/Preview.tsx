'use client';

import { useTranslations } from 'next-intl';

import { getAssetListKeyGenerator } from '@api/getAssetListQuery';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';

import { applyDelta, roundToCurrency, wouldOverdraw } from '@core/accounts/balance';

import { useCurrency } from '@hooks/use-currency';

import type { Asset } from '@/@types/asset';

interface AccountBalancePreviewProps {
  assetId: number | null;
  amount: number;
  currency: string;
}

/**
 * The before→after line under the account picker.
 *
 * Reuses `applyDelta` from `@core/accounts/balance` — the same function the
 * server's SQL mirrors — so the number shown here and the number written to the
 * database agree by construction rather than because two people wrote the same
 * formula. Conversion goes through `useCurrency().convert` with no date, i.e.
 * today's rate, matching the server's rate policy for the account leg.
 */
const AccountBalancePreview = ({ assetId, amount, currency }: AccountBalancePreviewProps) => {
  const t = useTranslations('forms.expense');
  const { data: assets = [] } = useQuery<Asset[]>({ queryKey: getAssetListKeyGenerator() });
  const { convert, formatFull } = useCurrency();

  const asset = assetId === null ? undefined : assets.find((a) => a.id === assetId);
  if (!asset || !amount || amount <= 0) return null;

  const converted = currency === asset.currency ? amount : convert(amount, currency, asset.currency);
  if (converted === null) return null;

  const delta = roundToCurrency(converted, asset.currency);
  const after = applyDelta(asset.amount, delta, asset.currency);
  const overdraws = wouldOverdraw(asset.amount, delta);

  return (
    <div className="space-y-0.5">
      {/* Forced LTR: the arrow means "becomes", and mirroring it under RTL
          would read as money flowing the other way. */}
      <p dir="ltr" className="text-text-muted flex items-center gap-1.5 text-xs tabular-nums">
        {/* formatFull, not format: a compact preference rendering 99,500,000 as
            99.5M would collapse the very digits this comparison exists to show. */}
        <span>{formatFull(asset.amount, asset.currency)}</span>
        <ArrowRight className="h-3 w-3 shrink-0" aria-hidden="true" />
        <span className={overdraws ? 'text-warning font-medium' : 'text-text-secondary font-medium'}>
          {formatFull(after, asset.currency)}
        </span>
      </p>
      {overdraws && <p className="text-warning text-xs">{t('paidFromOverdraw', { account: asset.name })}</p>}
    </div>
  );
};

export default AccountBalancePreview;
