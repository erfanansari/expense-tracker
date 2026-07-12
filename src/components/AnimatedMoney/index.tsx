'use client';

import NumberFlow from '@number-flow/react';

import { getCurrency } from '@/constants/currencies';

interface AnimatedMoneyProps {
  amount: number;
  currency: string;
  /** Compact notation (1.2K, 3.4M) — mirrors formatMoney's compact mode. */
  compact?: boolean;
  className?: string;
}

/**
 * Animated counterpart of formatMoney (src/features/ExchangeRate/utils/currency.ts):
 * same Intl options and symbol placement. Animates ONLY when the value changes
 * while mounted (NumberFlow's default) — page loads render statically; the roll
 * is feedback for user actions (filters, mutations, currency switches).
 */
const AnimatedMoney = ({ amount, currency, compact = true, className }: AnimatedMoneyProps) => {
  const def = getCurrency(currency);

  return (
    <NumberFlow
      value={amount}
      locales="en-US"
      format={
        compact
          ? { notation: 'compact', compactDisplay: 'short', maximumFractionDigits: 2 }
          : { minimumFractionDigits: 0, maximumFractionDigits: def.decimals }
      }
      prefix={def.symbolPosition === 'prefix' ? def.symbol : undefined}
      suffix={def.symbolPosition === 'suffix' ? ` ${def.symbol}` : undefined}
      className={className}
    />
  );
};

/** Animated plain integer (e.g. filtered result counts). */
export const AnimatedCount = ({ value, className }: { value: number; className?: string }) => (
  <NumberFlow value={value} locales="en-US" className={className} />
);

export default AnimatedMoney;
