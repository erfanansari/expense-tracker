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

export function getAssetCategoryLabel(category: string): { en: string; fa: string; icon: string } {
  const found = ASSET_CATEGORIES.find((c) => c.value === category);
  return found
    ? { en: found.label, fa: found.labelFa, icon: found.icon }
    : { en: category, fa: category, icon: 'circle' };
}
