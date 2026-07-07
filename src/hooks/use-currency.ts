'use client';

import { useMemo } from 'react';

import { convert, formatMoney } from '@features/ExchangeRate/utils/currency';
import type { RatesSeries } from '@features/ExchangeRate/utils/currency';

import { useAuth } from '@hooks/use-auth';
import { useRates } from '@hooks/use-rates';

import type { NumberFormat } from '@stores/currency';
import { useCurrencyStore } from '@stores/currency';

/** Options for money formatting/conversion helpers. */
interface FormatOpts {
  /** Request compact (10.69B) — only honored when numberFormat is 'auto'. */
  compact?: boolean;
}

export interface MoneyDisplay {
  primary: string;
  /** null = secondary disabled, same as primary, or rate unavailable. */
  secondary: string | null;
}

/** A monetary item to be summed/converted at its own historical date. */
export interface MoneyItem {
  amount: number;
  currency: string;
  date?: string;
}

export interface CurrencyHelpers {
  primaryCurrency: string;
  secondaryCurrency: string | null;
  numberFormat: NumberFormat;
  series: RatesSeries;
  isLoading: boolean;
  /** Convert a stored amount/currency into primary + optional secondary strings. */
  display: (amount: number, currency: string, date?: string, opts?: FormatOpts) => MoneyDisplay;
  /** Convert one amount between currencies at a given date (null if no rate). */
  convert: (amount: number, from: string, to: string, date?: string) => number | null;
  /** Format a numeric value in a currency, honoring the user's numberFormat. */
  format: (value: number, currency: string, opts?: FormatOpts) => string;
  /** Always-full formatting (ignores numberFormat) — for hover/exact display. */
  formatFull: (value: number, currency: string) => string;
  /**
   * Sum a list of money items into a target currency, converting EACH item at
   * its own date (historically accurate; stable over time). Unconvertible items
   * are skipped. This is what aggregates must use instead of converting a
   * pre-summed pivot total at today's rate.
   */
  sumTo: (items: MoneyItem[], to: string) => number;
  /** Sum items into primary + optional secondary, formatted for display. */
  sumDisplay: (items: MoneyItem[], opts?: FormatOpts) => MoneyDisplay;
}

/**
 * Currency preferences (from the currency store, hydrated by CurrencyHydrator)
 * combined with the shared rates series into formatting/conversion helpers.
 */
export function useCurrency(): CurrencyHelpers {
  // Only fetch rates once authenticated — this hook renders on auth pages too
  // (via global drawers), so gating avoids firing authed requests on login.
  const { user } = useAuth();
  const { data: ratesData, isLoading: ratesLoading } = useRates(!!user);

  const primaryCurrency = useCurrencyStore((state) => state.primaryCurrency);
  const secondaryCurrency = useCurrencyStore((state) => state.secondaryCurrency);
  const numberFormat = useCurrencyStore((state) => state.numberFormat);
  const hydrated = useCurrencyStore((state) => state.hydrated);

  return useMemo<CurrencyHelpers>(() => {
    const series = ratesData?.series ?? {};

    // For undated values (aggregates/current balances) convert at today's rate —
    // carry-forward ignores any future-dated rows.
    const todayStr = new Date().toISOString().split('T')[0];

    // 'compact'/'full' apply everywhere; 'auto' compacts only where a caller asks
    // (cards & charts) and stays full elsewhere (tables, lists).
    const isCompact = (opts?: FormatOpts): boolean => {
      if (numberFormat === 'compact') return true;
      if (numberFormat === 'full') return false;
      return opts?.compact ?? false; // 'auto'
    };

    const boundConvert = (amount: number, from: string, to: string, date?: string): number | null =>
      convert(amount, from, to, series, date ?? todayStr);

    const fmt = (value: number, currency: string, opts?: FormatOpts): string =>
      formatMoney(value, currency, { compact: isCompact(opts) });

    const display = (amount: number, currency: string, date?: string, opts?: FormatOpts): MoneyDisplay => {
      const primaryValue = boundConvert(amount, currency, primaryCurrency, date);
      const primary = primaryValue === null ? '—' : fmt(primaryValue, primaryCurrency, opts);

      // Secondary only renders when set AND different from primary.
      if (!secondaryCurrency || secondaryCurrency === primaryCurrency) {
        return { primary, secondary: null };
      }
      const secondaryValue = boundConvert(amount, currency, secondaryCurrency, date);
      const secondary = secondaryValue === null ? '—' : fmt(secondaryValue, secondaryCurrency, opts);
      return { primary, secondary };
    };

    // Convert each item at ITS OWN date and sum — historically accurate & stable.
    const sumTo = (items: MoneyItem[], to: string): number => {
      let total = 0;
      for (const it of items) {
        const v = boundConvert(it.amount, it.currency, to, it.date);
        if (v !== null) total += v;
      }
      return total;
    };

    const sumDisplay = (items: MoneyItem[], opts?: FormatOpts): MoneyDisplay => {
      const primary = fmt(sumTo(items, primaryCurrency), primaryCurrency, opts);
      if (!secondaryCurrency || secondaryCurrency === primaryCurrency) return { primary, secondary: null };
      return { primary, secondary: fmt(sumTo(items, secondaryCurrency), secondaryCurrency, opts) };
    };

    return {
      primaryCurrency,
      secondaryCurrency,
      numberFormat,
      series,
      isLoading: !hydrated || ratesLoading,
      display,
      convert: boundConvert,
      format: fmt,
      formatFull: (value: number, currency: string) => formatMoney(value, currency),
      sumTo,
      sumDisplay,
    };
  }, [primaryCurrency, secondaryCurrency, numberFormat, hydrated, ratesData?.series, ratesLoading]);
}
