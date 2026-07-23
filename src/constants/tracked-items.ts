// Tracked (auto-priced) items — Navasan-quoted commodities an asset can link to
// via `assets.linkedItem`. Deliberately separate from the currency registry:
// these are unit PRICES, not currencies — they must never appear in currency
// pickers, SUPPORTED_CURRENCY_CODES, or the summary's currency validation.
// Their daily prices live in the same currencyRates table under `code`
// (synthetic codes can't collide with real currency codes).
//
// Adding a new tracked item (e.g. 18-ayar gram gold or BTC) = one entry here.
// IMPORTANT: verify the Navasan unit before setting `scale` — items differ
// (gold coins are quoted in THOUSAND Toman, currencies/crypto in plain Toman).

export interface TrackedItemDef {
  /** Synthetic series code stored in currencyRates.currency (e.g. GOLD_SEKKEH). */
  code: string;
  /** Exact Navasan /latest/ response key. */
  navasanItem: string;
  label: string;
  labelFa: string;
  /** Suggested `unit` value for assets linked to this item. */
  defaultUnit: string;
  defaultUnitFa: string;
  /**
   * Multiplier from the raw Navasan value to Toman per unit. Gold coins are
   * quoted in thousand-Toman (sekkeh 189,000 → 189,000,000 Toman) — verified
   * against a live /latest/ response, July 2026.
   */
  scale: number;
  /**
   * Normalized needles for the name-based SUGGESTION in the asset form. Only
   * ever powers a "link this?" hint the user confirms — never silent linking
   * (spelling variants like امامی/emami/imami are exactly why the link itself
   * is explicit).
   */
  nameHints: string[];
}

export const TRACKED_ITEMS: readonly TrackedItemDef[] = [
  {
    code: 'GOLD_SEKKEH',
    navasanItem: 'sekkeh',
    label: 'Emami Coin',
    labelFa: 'سکه امامی',
    defaultUnit: 'coin',
    defaultUnitFa: 'عدد',
    scale: 1000,
    nameHints: ['امامی', 'emami', 'imami', 'سکه تمام', 'تمام سکه', 'full coin'],
  },
  {
    code: 'GOLD_BAHAR',
    navasanItem: 'bahar',
    label: 'Bahar Azadi Coin',
    labelFa: 'سکه بهار آزادی',
    defaultUnit: 'coin',
    defaultUnitFa: 'عدد',
    scale: 1000,
    nameHints: ['بهار', 'bahar', 'آزادی', 'azadi'],
  },
  {
    code: 'GOLD_NIM',
    navasanItem: 'nim',
    label: 'Half Coin',
    labelFa: 'نیم سکه',
    defaultUnit: 'coin',
    defaultUnitFa: 'عدد',
    scale: 1000,
    nameHints: ['نیم سکه', 'نیم‌سکه', 'nim', 'half coin'],
  },
  {
    code: 'GOLD_ROB',
    navasanItem: 'rob',
    label: 'Quarter Coin',
    labelFa: 'ربع سکه',
    defaultUnit: 'coin',
    defaultUnitFa: 'عدد',
    scale: 1000,
    nameHints: ['ربع', 'rob', 'quarter coin'],
  },
  {
    code: 'GOLD_18AYAR',
    navasanItem: '18ayar',
    label: '18K Gold (gram)',
    labelFa: 'طلای ۱۸ عیار (گرمی)',
    defaultUnit: 'gram',
    defaultUnitFa: 'گرم',
    // Unlike the coins, 18ayar is quoted in plain Toman per gram.
    scale: 1,
    nameHints: ['طلا گرمی', 'طلای گرمی', '۱۸ عیار', '18 عیار', 'طلای ۱۸', '18ayar', 'gram gold'],
  },
  {
    code: 'GOLD_GERAMI',
    navasanItem: 'gerami',
    label: 'Gram Coin',
    labelFa: 'سکه گرمی',
    defaultUnit: 'coin',
    defaultUnitFa: 'عدد',
    // "گرمی" alone would false-match gram GOLD assets (طلا گرمی), so hints
    // require the coin context.
    scale: 1000,
    nameHints: ['سکه گرمی', 'سکه‌ گرمی', 'gerami'],
  },
] as const;

export const TRACKED_ITEM_CODES = TRACKED_ITEMS.map((i) => i.code);

export function getTrackedItem(code: string | null | undefined): TrackedItemDef | null {
  if (!code) return null;
  return TRACKED_ITEMS.find((i) => i.code === code) ?? null;
}

export function isTrackedItemCode(code: string): boolean {
  return TRACKED_ITEM_CODES.includes(code);
}

/** Normalize for hint matching: Arabic→Persian glyphs, strip ZWNJ, lowercase. */
function normalizeName(s: string): string {
  return s.replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/‌/g, ' ').replace(/\s+/g, ' ').toLowerCase().trim();
}

/**
 * Best tracked-item suggestion for a free-text asset name, or null. Longest
 * matching hint wins so "سکه بهار آزادی" suggests bahar, not a generic coin.
 */
export function suggestTrackedItem(name: string): TrackedItemDef | null {
  const normalized = normalizeName(name);
  if (!normalized) return null;

  let best: TrackedItemDef | null = null;
  let bestLen = 0;
  for (const item of TRACKED_ITEMS) {
    for (const hint of item.nameHints) {
      const h = normalizeName(hint);
      if (h.length > bestLen && normalized.includes(h)) {
        best = item;
        bestLen = h.length;
      }
    }
  }
  return best;
}
