import type { NumberFormat } from '@core/database/currency-preferences';

/** An amount already converted for email display. */
export interface EmailMoney {
  /** Value in the user's primary currency. */
  primary: number;
  /** Value in the secondary currency; null = secondary disabled or rate unavailable. */
  secondary: number | null;
}

/** Per-user currency display settings threaded through every report email. */
export interface EmailCurrencyContext {
  primaryCurrency: string;
  secondaryCurrency: string | null;
  numberFormat: NumberFormat;
}

/**
 * Same rule as CurrencyProvider: 'auto' compacts only where the surface wants
 * it (stat cards, net worth), 'compact'/'full' apply everywhere.
 */
export function isCompact(numberFormat: NumberFormat, wantsCompact: boolean): boolean {
  if (numberFormat === 'compact') return true;
  if (numberFormat === 'full') return false;
  return wantsCompact;
}
