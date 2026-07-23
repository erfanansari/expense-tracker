// Central currency registry — the single source of truth for supported currencies.
// Never hardcode currency codes/symbols/decimals elsewhere; import from here (DRY).

export interface CurrencyDef {
  /** ISO-style app code. IRT = Iranian Toman (Rial / 10). */
  code: string;
  label: string;
  labelFa: string;
  /** Display symbol/code shown next to the amount. */
  symbol: string;
  /**
   * fa-locale display symbol. Equal to `symbol` for currencies with a
   * universal glyph ($, €, £, ₺...) or a widely-recognized international code
   * used as-is in Farsi financial contexts (AED, CHF). IRT is the one
   * exception: it's an app-invented code, not a real ISO one, and Farsi
   * speakers call it تومان in everyday use — so this is the one place that
   * actually differs from `symbol`.
   */
  symbolFa: string;
  /** Symbol position relative to the number. */
  symbolPosition: 'prefix' | 'suffix';
  /**
   * Whether a prefix symbol gets a space before the number (`AED 50`).
   * Native locale convention glues single-glyph symbols ($, €, £, ₺, C$, A$)
   * directly to the number but spaces out plain multi-letter codes (AED,
   * CHF) — true only for those. Unused for suffix currencies, which always
   * get a space (`50 kr`) regardless.
   */
  spacedSymbol: boolean;
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
    symbolFa: 'تومان',
    symbolPosition: 'suffix',
    spacedSymbol: false,
    decimals: 0,
    navasanItem: null,
  },
  {
    code: 'USD',
    label: 'US Dollar',
    labelFa: 'دلار آمریکا',
    symbol: '$',
    symbolFa: '$',
    symbolPosition: 'prefix',
    spacedSymbol: false,
    decimals: 2,
    navasanItem: 'usd',
  },
  {
    code: 'EUR',
    label: 'Euro',
    labelFa: 'یورو',
    symbol: '€',
    symbolFa: '€',
    symbolPosition: 'prefix',
    spacedSymbol: false,
    decimals: 2,
    navasanItem: 'eur',
  },
  {
    code: 'GBP',
    label: 'British Pound',
    labelFa: 'پوند انگلیس',
    symbol: '£',
    symbolFa: '£',
    symbolPosition: 'prefix',
    spacedSymbol: false,
    decimals: 2,
    navasanItem: 'gbp',
  },
  {
    code: 'AED',
    label: 'UAE Dirham',
    labelFa: 'درهم امارات',
    symbol: 'AED',
    symbolFa: 'AED',
    symbolPosition: 'prefix',
    spacedSymbol: true,
    decimals: 2,
    navasanItem: 'aed',
  },
  {
    code: 'TRY',
    label: 'Turkish Lira',
    labelFa: 'لیر ترکیه',
    symbol: '₺',
    symbolFa: '₺',
    symbolPosition: 'prefix',
    spacedSymbol: false,
    decimals: 2,
    navasanItem: 'try',
  },
  {
    code: 'CAD',
    label: 'Canadian Dollar',
    labelFa: 'دلار کانادا',
    symbol: 'C$',
    symbolFa: 'C$',
    symbolPosition: 'prefix',
    spacedSymbol: false,
    decimals: 2,
    navasanItem: 'cad',
  },
  {
    code: 'AUD',
    label: 'Australian Dollar',
    labelFa: 'دلار استرالیا',
    symbol: 'A$',
    symbolFa: 'A$',
    symbolPosition: 'prefix',
    spacedSymbol: false,
    decimals: 2,
    navasanItem: 'aud',
  },
  {
    code: 'SEK',
    label: 'Swedish Krona',
    labelFa: 'کرون سوئد',
    symbol: 'kr',
    symbolFa: 'kr',
    symbolPosition: 'suffix',
    spacedSymbol: false,
    decimals: 2,
    navasanItem: 'sek',
  },
  {
    code: 'CHF',
    label: 'Swiss Franc',
    labelFa: 'فرانک سوئیس',
    symbol: 'CHF',
    symbolFa: 'CHF',
    symbolPosition: 'prefix',
    spacedSymbol: true,
    decimals: 2,
    navasanItem: 'chf',
  },
  {
    code: 'AMD',
    label: 'Armenian Dram',
    labelFa: 'درام ارمنستان',
    // Use the code (not the ֏ dram glyph) so it renders in the app font, like
    // AED/CHF — spaced multi-letter prefix per native convention.
    symbol: 'AMD',
    symbolFa: 'AMD',
    symbolPosition: 'prefix',
    spacedSymbol: true,
    decimals: 2,
    navasanItem: 'amd',
  },
] as const;

/** Localized "CODE (Name)" options for currency picker dropdowns. */
export function getLocalizedCurrencyOptions(locale: 'en' | 'fa'): { value: string; label: string }[] {
  return CURRENCIES.map((c) => ({ value: c.code, label: `${c.code} (${locale === 'fa' ? c.labelFa : c.label})` }));
}

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
