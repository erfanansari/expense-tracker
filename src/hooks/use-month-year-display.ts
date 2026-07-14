'use client';

import { useLocale } from 'next-intl';

import { useMonthLabel } from '@hooks/use-constant-labels';
import { useLocalePreferences } from '@hooks/use-locale-preferences';

import { formatYear, getJalaliMonthName, getJalaliYear, resolveCalendar } from '@utils';
import type { AppLocale } from '@utils';

export interface MonthYearDisplay {
  primary: string;
  /** null when the secondary caption is toggled off. */
  secondary: string | null;
}

/**
 * Primary/secondary month+year pair for Income's Gregorian month/year integers,
 * following the calendar + secondary-caption preferences — the month-granularity
 * counterpart of useAppDate (which handles full ISO dates).
 */
export function useMonthYearDisplay() {
  const locale = useLocale() as AppLocale;
  const monthLabel = useMonthLabel();
  const { prefs } = useLocalePreferences();
  const calendar = resolveCalendar(prefs.calendar, locale);

  return (month: number, year: number): MonthYearDisplay => {
    const gregorian = `${monthLabel(month)} ${formatYear(year, locale)}`;
    const jalali = `${getJalaliMonthName(month, year)} ${formatYear(getJalaliYear(month, year), locale)}`;

    if (calendar === 'jalali') {
      return { primary: jalali, secondary: prefs.secondaryDateCaptions ? gregorian : null };
    }
    return { primary: gregorian, secondary: prefs.secondaryDateCaptions ? jalali : null };
  };
}
