export const ASSET_CATEGORIES = [
  { value: 'cash', label: 'Cash', labelFa: 'پول نقد', icon: 'banknote' },
  { value: 'crypto', label: 'Cryptocurrency', labelFa: 'ارز دیجیتال', icon: 'bitcoin' },
  { value: 'commodity', label: 'Commodities', labelFa: 'طلا و کالا', icon: 'gem' },
  { value: 'vehicle', label: 'Vehicles', labelFa: 'خودرو', icon: 'car' },
  { value: 'property', label: 'Real Estate', labelFa: 'ملک', icon: 'building' },
  { value: 'bank', label: 'Bank Accounts', labelFa: 'حساب بانکی', icon: 'landmark' },
  { value: 'investment', label: 'Investments', labelFa: 'سرمایه‌گذاری', icon: 'trending-up' },
] as const;

export const ASSET_CATEGORY_COLORS: Record<string, string> = {
  cash: '#10b981',
  crypto: '#f59e0b',
  commodity: '#eab308',
  vehicle: '#6366f1',
  property: '#0070f3',
  bank: '#8b5cf6',
  investment: '#ec4899',
};

export function getAssetCategoryLabel(category: string): { en: string; fa: string; icon: string } {
  const found = ASSET_CATEGORIES.find((c) => c.value === category);
  return found
    ? { en: found.label, fa: found.labelFa, icon: found.icon }
    : { en: category, fa: category, icon: 'circle' };
}
