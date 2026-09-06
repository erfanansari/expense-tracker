export const ASSET_CATEGORIES = [
  { value: 'cash', label: 'Cash', labelFa: 'پول نقد', icon: 'banknote' },
  { value: 'crypto', label: 'Cryptocurrency', labelFa: 'ارز دیجیتال', icon: 'bitcoin' },
  { value: 'commodity', label: 'Commodities', labelFa: 'طلا و کالا', icon: 'gem' },
  { value: 'vehicle', label: 'Vehicles', labelFa: 'خودرو', icon: 'car' },
  { value: 'property', label: 'Real Estate', labelFa: 'ملک', icon: 'building' },
  { value: 'bank', label: 'Bank Accounts', labelFa: 'حساب بانکی', icon: 'landmark' },
  { value: 'investment', label: 'Investments', labelFa: 'سرمایه‌گذاری', icon: 'trending-up' },
] as const;

/** Points at the shared `--color-cat-*` accents so asset swatches and the
 *  portfolio pie retint with the theme instead of staying light-mode hexes. */
export const ASSET_CATEGORY_COLORS: Record<string, string> = {
  cash: 'var(--color-cat-green)',
  crypto: 'var(--color-cat-amber)',
  commodity: 'var(--color-cat-orange)',
  vehicle: 'var(--color-cat-indigo)',
  property: 'var(--color-cat-blue)',
  bank: 'var(--color-cat-violet)',
  investment: 'var(--color-cat-pink)',
};

export const ASSET_CATEGORY_COLOR_FALLBACK = 'var(--color-text-secondary)';

/**
 * The asset categories you can *spend out of*, as opposed to merely track.
 *
 * Every serious tracker draws this line — YNAB splits budget from tracking
 * accounts, Actual Budget on-budget from off-budget, Firefly III makes a
 * withdrawal's source an asset account. The reason is the same everywhere: you
 * hand over cash and you move money out of a bank, but you do not pay rent
 * "from" your apartment. Kharji gets the split for free from the category.
 *
 * This constant is the single source of truth — never re-spell the pair inline.
 */
export const SPENDABLE_ASSET_CATEGORIES = ['cash', 'bank'] as const;

export type SpendableAssetCategory = (typeof SPENDABLE_ASSET_CATEGORIES)[number];

export function isSpendableAssetCategory(category: string): category is SpendableAssetCategory {
  return (SPENDABLE_ASSET_CATEGORIES as readonly string[]).includes(category);
}

/**
 * How a spendable account is drawn in the expense form's account picker.
 *
 * `CategoryTile` is the shared "a thing you pick from a list" primitive, and it
 * resolves its icon and colour through the *category* registry
 * (`getCategoryIcon` / `getCategoryColor` in `@constants/categories`), which
 * takes plain keys. `ASSET_CATEGORY_COLORS` above stores rendered CSS variable
 * strings instead, so the two cannot be shared — the values here are the same
 * hues deliberately (`violet` for bank, `green` for cash), just spelled in the
 * other registry's vocabulary. Retune one and you must retune the other.
 */
export const SPENDABLE_ASSET_TILE: Record<SpendableAssetCategory, { icon: string; color: string }> = {
  cash: { icon: 'Wallet', color: 'green' },
  bank: { icon: 'CreditCard', color: 'violet' },
};

export function getAssetCategoryLabel(category: string): { en: string; fa: string; icon: string } {
  const found = ASSET_CATEGORIES.find((c) => c.value === category);
  return found
    ? { en: found.label, fa: found.labelFa, icon: found.icon }
    : { en: category, fa: category, icon: 'circle' };
}
