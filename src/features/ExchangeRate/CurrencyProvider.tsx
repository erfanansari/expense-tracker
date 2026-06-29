'use client';

import { createContext, useContext, useMemo } from 'react';
import type { FC, PropsWithChildren } from 'react';

import { useAuth } from '@hooks/use-auth';
import { useCurrencyPreferences } from '@hooks/use-currency-preferences';
import { useRates } from '@hooks/use-rates';

import { convert, formatMoney } from './utils/currency';
import type { RatesSeries } from './utils/currency';

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

interface CurrencyContextValue {
  primaryCurrency: string;
  secondaryCurrency: string | null;
  series: RatesSeries;
  isLoading: boolean;
  /** Convert a stored amount/currency into primary + optional secondary strings. */
  display: (amount: number, currency: string, date?: string) => MoneyDisplay;
  /** Convert one amount between currencies at a given date (null if no rate). */
  convert: (amount: number, from: string, to: string, date?: string) => number | null;
  /** Format a numeric value in a currency (symbol + locale). */
  format: (value: number, currency: string) => string;
  /**
   * Sum a list of money items into a target currency, converting EACH item at
   * its own date (historically accurate; stable over time). Unconvertible items
   * are skipped. This is what aggregates must use instead of converting a
   * pre-summed pivot total at today's rate.
   */
  sumTo: (items: MoneyItem[], to: string) => number;
  /** Sum items into primary + optional secondary, formatted for display. */
  sumDisplay: (items: MoneyItem[]) => MoneyDisplay;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export const CurrencyProvider: FC<PropsWithChildren> = ({ children }) => {
  // Only fetch user prefs / rates once authenticated — this provider wraps the
  // whole app (including auth pages and global drawers), so gating avoids firing
  // authed requests on the login screen.
  const { user } = useAuth();
  const enabled = !!user;
  const { prefs, isLoading: prefsLoading } = useCurrencyPreferences(enabled);
  const { data: ratesData, isLoading: ratesLoading } = useRates(enabled);

  const value = useMemo<CurrencyContextValue>(() => {
    const series = ratesData?.series ?? {};
    const primaryCurrency = prefs.primaryCurrency;
    const secondaryCurrency = prefs.secondaryCurrency;

    // For undated values (aggregates/current balances) convert at today's rate —
    // carry-forward ignores any future-dated rows.
    const todayStr = new Date().toISOString().split('T')[0];

    const boundConvert = (amount: number, from: string, to: string, date?: string): number | null =>
      convert(amount, from, to, series, date ?? todayStr);

    const display = (amount: number, currency: string, date?: string): MoneyDisplay => {
      const primaryValue = boundConvert(amount, currency, primaryCurrency, date);
      const primary = primaryValue === null ? '—' : formatMoney(primaryValue, primaryCurrency);

      // Secondary only renders when set AND different from primary.
      if (!secondaryCurrency || secondaryCurrency === primaryCurrency) {
        return { primary, secondary: null };
      }
      const secondaryValue = boundConvert(amount, currency, secondaryCurrency, date);
      const secondary = secondaryValue === null ? '—' : formatMoney(secondaryValue, secondaryCurrency);
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

    const sumDisplay = (items: MoneyItem[]): MoneyDisplay => {
      const primary = formatMoney(sumTo(items, primaryCurrency), primaryCurrency);
      if (!secondaryCurrency || secondaryCurrency === primaryCurrency) return { primary, secondary: null };
      return { primary, secondary: formatMoney(sumTo(items, secondaryCurrency), secondaryCurrency) };
    };

    return {
      primaryCurrency,
      secondaryCurrency,
      series,
      isLoading: prefsLoading || ratesLoading,
      display,
      convert: boundConvert,
      format: formatMoney,
      sumTo,
      sumDisplay,
    };
  }, [prefs.primaryCurrency, prefs.secondaryCurrency, ratesData?.series, prefsLoading, ratesLoading]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider');
  return ctx;
}
