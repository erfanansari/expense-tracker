'use client';

import { useLocale } from 'next-intl';

import { useLocalePreferences } from '@hooks/use-locale-preferences';

import { formatAppDate, resolveCalendar } from '@utils';
import type { AppLocale } from '@utils';

export interface AppDateDisplay {
  primary: string;
  /** null when the secondary caption is toggled off. */
  secondary: string | null;
}

/**
 * Primary/secondary date pair for a full ISO (yyyy-MM-dd) date, following the
 * calendar + secondary-caption preferences. Default prefs (en, gregorian, captions
 * on) reproduce the app's original always-on Jalali sub-caption behavior exactly —
 * including rendering the raw ISO string as the primary value, unchanged.
 */
export function useAppDate() {
  const locale = useLocale() as AppLocale;
  const { prefs } = useLocalePreferences();
  const calendar = resolveCalendar(prefs.calendar, locale);

  return (dateStr: string): AppDateDisplay => {
    if (locale === 'en' && calendar === 'gregorian') {
      return {
        primary: dateStr,
        secondary: prefs.secondaryDateCaptions ? formatAppDate(dateStr, { locale: 'fa', calendar: 'jalali' }) : null,
      };
    }
    if (locale === 'en' && calendar === 'jalali') {
      // A Gregorian anchor always accompanies a Jalali primary in the English UI.
      return { primary: formatAppDate(dateStr, { locale: 'en', calendar: 'jalali' }), secondary: dateStr };
    }
    const secondaryCalendar = calendar === 'jalali' ? 'gregorian' : 'jalali';
    return {
      primary: formatAppDate(dateStr, { locale: 'fa', calendar }),
      secondary: prefs.secondaryDateCaptions
        ? formatAppDate(dateStr, { locale: 'fa', calendar: secondaryCalendar })
        : null,
    };
  };
}
