export const ASSET_CATEGORIES = [
  { value: 'cash', label: 'Cash', labelFa: 'نقدی', icon: 'banknote' },
  { value: 'crypto', label: 'Cryptocurrency', labelFa: 'ارز دیجیتال', icon: 'bitcoin' },
  { value: 'commodity', label: 'Commodities', labelFa: 'کالا', icon: 'gem' },
  { value: 'vehicle', label: 'Vehicles', labelFa: 'خودرو', icon: 'car' },
  { value: 'property', label: 'Real Estate', labelFa: 'املاک', icon: 'building' },
  { value: 'bank', label: 'Bank Accounts', labelFa: 'حساب بانکی', icon: 'landmark' },
  { value: 'investment', label: 'Investments', labelFa: 'سرمایه‌گذاری', icon: 'trending-up' },
] as const;

export function getAssetCategoryLabel(category: string): { en: string; fa: string; icon: string } {
  const found = ASSET_CATEGORIES.find((c) => c.value === category);
  return found
    ? { en: found.label, fa: found.labelFa, icon: found.icon }
    : { en: category, fa: category, icon: 'circle' };
}
