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

interface CurrencyContextValue {
  primaryCurrency: string;
  secondaryCurrency: string | null;
  series: RatesSeries;
  isLoading: boolean;
  /** Convert a stored amount/currency into primary + optional secondary strings. */
  display: (amount: number, currency: string, date?: string) => MoneyDisplay;
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

    const display = (amount: number, currency: string, date?: string): MoneyDisplay => {
      const effectiveDate = date ?? todayStr;
      const primaryValue = convert(amount, currency, primaryCurrency, series, effectiveDate);
      const primary = primaryValue === null ? '—' : formatMoney(primaryValue, primaryCurrency);

      // Secondary only renders when set AND different from primary.
      if (!secondaryCurrency || secondaryCurrency === primaryCurrency) {
        return { primary, secondary: null };
      }
      const secondaryValue = convert(amount, currency, secondaryCurrency, series, effectiveDate);
      const secondary = secondaryValue === null ? '—' : formatMoney(secondaryValue, secondaryCurrency);
      return { primary, secondary };
    };

    return {
      primaryCurrency,
      secondaryCurrency,
      series,
      isLoading: prefsLoading || ratesLoading,
      display,
    };
  }, [prefs.primaryCurrency, prefs.secondaryCurrency, ratesData?.series, prefsLoading, ratesLoading]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider');
  return ctx;
}
