import { EXPENSE_CATEGORIES } from '@/constants/categories';

export function getCategoryLabel(category: string): { en: string; fa: string } {
  const cat = EXPENSE_CATEGORIES.find(c => c.value === category);
  return cat ? { en: cat.label, fa: cat.labelFa } : { en: category, fa: category };
}
