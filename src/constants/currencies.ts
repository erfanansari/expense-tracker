// Central currency registry — the single source of truth for supported currencies.
// Never hardcode currency codes/symbols/decimals elsewhere; import from here (DRY).

export interface CurrencyDef {
  /** ISO-style app code. IRT = Iranian Toman (Rial / 10). */
  code: string;
  label: string;
  labelFa: string;
  /** Display symbol/code shown next to the amount. */
  symbol: string;
  /** Symbol position relative to the number. */
  symbolPosition: 'prefix' | 'suffix';
  /** Fraction digits used by Intl.NumberFormat when formatting. */
  decimals: number;
  /**
   * The Navasan `/latest/` response key for this currency (null = the pivot,
   * which Navasan does not quote against itself). Values are Toman, matching
   * the existing usd convention in the app.
   */
  navasanItem: string | null;
}

export const CURRENCIES: readonly CurrencyDef[] = [
  {
    code: 'IRT',
    label: 'Iranian Toman',
    labelFa: 'تومان',
    symbol: 'IRT',
    symbolPosition: 'suffix',
    decimals: 0,
    navasanItem: null,
  },
  {
    code: 'USD',
    label: 'US Dollar',
    labelFa: 'دلار آمریکا',
    symbol: '$',
    symbolPosition: 'prefix',
    decimals: 2,
    navasanItem: 'usd',
  },
  {
    code: 'EUR',
    label: 'Euro',
    labelFa: 'یورو',
    symbol: '€',
    symbolPosition: 'prefix',
    decimals: 2,
    navasanItem: 'eur',
  },
  {
    code: 'GBP',
    label: 'British Pound',
    labelFa: 'پوند انگلیس',
    symbol: '£',
    symbolPosition: 'prefix',
    decimals: 2,
    navasanItem: 'gbp',
  },
  {
    code: 'AED',
    label: 'UAE Dirham',
    labelFa: 'درهم امارات',
    symbol: 'AED',
    symbolPosition: 'prefix',
    decimals: 2,
    navasanItem: 'aed',
  },
  {
    code: 'TRY',
    label: 'Turkish Lira',
    labelFa: 'لیر ترکیه',
    symbol: '₺',
    symbolPosition: 'prefix',
    decimals: 2,
    navasanItem: 'try',
  },
  {
    code: 'CAD',
    label: 'Canadian Dollar',
    labelFa: 'دلار کانادا',
    symbol: 'C$',
    symbolPosition: 'prefix',
    decimals: 2,
    navasanItem: 'cad',
  },
  {
    code: 'AUD',
    label: 'Australian Dollar',
    labelFa: 'دلار استرالیا',
    symbol: 'A$',
    symbolPosition: 'prefix',
    decimals: 2,
    navasanItem: 'aud',
  },
  {
    code: 'SEK',
    label: 'Swedish Krona',
    labelFa: 'کرون سوئد',
    symbol: 'kr',
    symbolPosition: 'suffix',
    decimals: 2,
    navasanItem: 'sek',
  },
  {
    code: 'CHF',
    label: 'Swiss Franc',
    labelFa: 'فرانک سوئیس',
    symbol: 'CHF',
    symbolPosition: 'prefix',
    decimals: 2,
    navasanItem: 'chf',
  },
] as const;

/**
 * The pivot (base) currency. Every stored rate is expressed as
 * "pivot units per 1 unit of <currency>". IRR/Toman is forced as the pivot
 * because Navasan only quotes foreign currencies against IRR. This constant is
 * the ONLY place the pivot is named — no DB column or other code hardcodes it.
 */
export const PIVOT_CURRENCY = 'IRT';

export const SUPPORTED_CURRENCY_CODES = CURRENCIES.map((c) => c.code);

/** Currencies that have a live Navasan rate (everything except the pivot). */
export const RATE_CURRENCIES = CURRENCIES.filter((c) => c.navasanItem !== null);

export function getCurrency(code: string): CurrencyDef {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

export function isSupportedCurrency(code: string | null | undefined): code is string {
  return !!code && SUPPORTED_CURRENCY_CODES.includes(code);
}
