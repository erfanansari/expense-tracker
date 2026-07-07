import { PIVOT_CURRENCY } from '@constants/currencies';
import { useStore } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';

export type NumberFormat = 'auto' | 'compact' | 'full';

export interface CurrencyPreferencesPayload {
  primaryCurrency: string;
  secondaryCurrency: string | null;
  numberFormat: NumberFormat;
}

interface CurrencyState extends CurrencyPreferencesPayload {
  /** False until preferences have been loaded from the server at least once. */
  hydrated: boolean;
  setPreferences: (prefs: Partial<CurrencyPreferencesPayload>) => void;
}

const currencyStore = createStore<CurrencyState>()(
  devtools((set) => ({
    primaryCurrency: PIVOT_CURRENCY,
    secondaryCurrency: 'USD',
    numberFormat: 'auto',
    hydrated: false,
    setPreferences: (prefs) => set({ ...prefs, hydrated: true }, undefined, 'setPreferences'),
  }))
);

export const useCurrencyStore = <T>(selector: (state: CurrencyState) => T): T => useStore(currencyStore, selector);

export default currencyStore;
