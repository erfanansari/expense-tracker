'use client';

import { useLocale, useTranslations } from 'next-intl';

import { isCalendarSensitive } from '@constants/recurring';

import type { AppLocale } from '@utils';

import type { RecurrenceCalendar, RecurrenceFrequency } from '@/@types/recurring';

interface SummaryInput {
  frequency: RecurrenceFrequency;
  intervalCount: number;
  calendar: RecurrenceCalendar;
}

/**
 * Renders a schedule as a phrase — "Every month", "Every 2 weeks".
 *
 * The calendar is named only when it actually changes the meaning (monthly and
 * yearly) *and* differs from the calendar the reader is already using. Telling a
 * Persian user their monthly rent is "Jalali" is noise; telling them a rule is
 * "Gregorian" is the thing they need to know.
 */
export function useRecurrenceSummary() {
  const t = useTranslations('forms.repeat');
  const locale = useLocale() as AppLocale;

  return ({ frequency, intervalCount, calendar }: SummaryInput): string => {
    const base = t(`summary.${frequency}`, { interval: intervalCount });
    if (!isCalendarSensitive(frequency)) return base;

    const readerCalendar: RecurrenceCalendar = locale === 'fa' ? 'jalali' : 'gregorian';
    if (calendar === readerCalendar) return base;

    return `${base} · ${t(`calendarShort.${calendar}`)}`;
  };
}
