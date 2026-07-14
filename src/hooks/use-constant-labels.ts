'use client';

import { useTranslations } from 'next-intl';

import { ASSET_CATEGORIES } from '@constants/assets';
import { INCOME_TYPES } from '@constants/income';

type AssetCategoryKey = (typeof ASSET_CATEGORIES)[number]['value'] | 'other';
type IncomeTypeKey = (typeof INCOME_TYPES)[number]['value'];

/** Localized asset-category label with a raw-value fallback for unknown data. */
export function useAssetCategoryLabel() {
  const t = useTranslations('constants.assetCategories');
  return (value: string): string => {
    const known = value === 'other' || ASSET_CATEGORIES.some((c) => c.value === value);
    return known ? t(value as AssetCategoryKey) : value;
  };
}

/** Localized income-type label with a raw-value fallback for unknown data. */
export function useIncomeTypeLabel() {
  const t = useTranslations('constants.incomeTypes');
  return (value: string): string => {
    const known = INCOME_TYPES.some((i) => i.value === value);
    return known ? t(value as IncomeTypeKey) : value;
  };
}

/** Localized Gregorian month name (1-12). */
export function useMonthLabel() {
  const t = useTranslations('constants.months');
  return (month: number): string => {
    if (month < 1 || month > 12) return String(month);
    return t(String(month) as `${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12}`);
  };
}
