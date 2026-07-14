import { format, parseISO } from 'date-fns';

export * from './jalali-calendar';

export type AppLocale = 'en' | 'fa';
export type CalendarPreference = 'auto' | 'gregorian' | 'jalali';
export type ResolvedCalendar = 'gregorian' | 'jalali';

/** auto: en -> gregorian, fa -> jalali. Explicit choices pass through untouched. */
export function resolveCalendar(pref: CalendarPreference, locale: AppLocale): ResolvedCalendar {
  if (pref !== 'auto') return pref;
  return locale === 'fa' ? 'jalali' : 'gregorian';
}

interface FormatAppDateOptions {
  locale: AppLocale;
  calendar: ResolvedCalendar;
}

/** Full day-level date (year, month, day) in the given locale + calendar system. */
export function formatAppDate(dateStr: string, { locale, calendar }: FormatAppDateOptions): string {
  const date = new Date(`${dateStr}T00:00:00`);
  const ca = calendar === 'jalali' ? 'persian' : 'gregory';
  const localeTag = locale === 'fa' ? `fa-IR-u-ca-${ca}` : `en-US-u-ca-${ca}`;
  return new Intl.DateTimeFormat(localeTag, { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
}

/** Date + time (e.g. a "created at" timestamp) in the given locale + calendar
 * system. Unlike formatAppDate, the input is a full ISO datetime, not a bare
 * yyyy-MM-dd — used for record-creation timestamps rather than user-entered dates. */
export function formatAppDateTime(isoDateTime: string, { locale, calendar }: FormatAppDateOptions): string {
  const date = new Date(isoDateTime);
  const ca = calendar === 'jalali' ? 'persian' : 'gregory';
  const localeTag = locale === 'fa' ? `fa-IR-u-ca-${ca}` : `en-US-u-ca-${ca}`;
  return new Intl.DateTimeFormat(localeTag, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

// Format a chart bucket key (yyyy-MM-dd or yyyy-MM) into a tooltip-friendly label
// based on the chart's aggregation granularity. `calendar` defaults to gregorian
// so existing (no-arg) call sites are unaffected; pass 'jalali' to show Jalali-first
// dates for fa locale (per the app's calendar preference).
export function formatChartTooltipDate(
  label: string,
  granularity: 'daily' | 'weekly' | 'monthly',
  locale: AppLocale = 'en',
  calendar: ResolvedCalendar = 'gregorian'
): string {
  if (locale === 'fa') {
    const ca = calendar === 'jalali' ? 'persian' : 'gregory';
    if (granularity === 'monthly') {
      return new Intl.DateTimeFormat(`fa-IR-u-ca-${ca}`, { year: 'numeric', month: 'long' }).format(
        parseISO(`${label}-01`)
      );
    }
    const formatted = new Intl.DateTimeFormat(`fa-IR-u-ca-${ca}`, {
      weekday: granularity === 'daily' ? 'short' : undefined,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(parseISO(label));
    return granularity === 'weekly' ? `هفتهٔ ${formatted}` : formatted;
  }

  if (granularity === 'monthly') return format(parseISO(`${label}-01`), 'MMMM yyyy');
  if (granularity === 'weekly') return `Week of ${format(parseISO(label), 'MMM d, yyyy')}`;
  return format(parseISO(label), 'EEE, MMM d, yyyy');
}

// Compact axis-tick label for a chart date. `style: 'day'` -> "Jul 13" / "۲۲ تیر";
// `style: 'month'` -> "Jul '26" / "تیر ۱۴۰۵". Defaults to gregorian for existing callers.
export function formatChartAxisDate(
  date: Date,
  style: 'day' | 'month',
  locale: AppLocale = 'en',
  calendar: ResolvedCalendar = 'gregorian'
): string {
  const ca = calendar === 'jalali' ? 'persian' : 'gregory';
  const localeTag = locale === 'fa' ? `fa-IR-u-ca-${ca}` : `en-US-u-ca-${ca}`;
  const opts: Intl.DateTimeFormatOptions =
    style === 'month' ? { month: 'short', year: '2-digit' } : { month: 'short', day: 'numeric' };
  return new Intl.DateTimeFormat(localeTag, opts).format(date);
}

/** Jalali month name for a Gregorian month/year (day=15 anchors the lookup to the
 * Jalali month that Gregorian month mostly overlaps — see getJalaliYear). */
export function getJalaliMonthName(gregorianMonth: number, gregorianYear: number): string {
  const date = new Date(gregorianYear, gregorianMonth - 1, 15);
  return new Intl.DateTimeFormat('fa-IR', { month: 'long' }).format(date);
}

/** Jalali year for a Gregorian month/year, anchored at day=15 of the month so the
 * whole month consistently maps to a single Jalali year (matches getJalaliMonthName).
 * `en-US` keeps the digits Latin; formatToParts avoids the "1404 AP" era suffix
 * that `.format()` appends for year-only output. */
export function getJalaliYear(gregorianMonth: number, gregorianYear: number): number {
  const date = new Date(gregorianYear, gregorianMonth - 1, 15);
  const parts = new Intl.DateTimeFormat('en-US-u-ca-persian', { year: 'numeric' }).formatToParts(date);
  return Number(parts.find((part) => part.type === 'year')?.value);
}

/** Effective calendar year for a Gregorian month/year, per resolved calendar —
 * Gregorian passes the stored year through unchanged; Jalali uses the day=15
 * anchor (getJalaliYear). Used to group/aggregate Income's Gregorian month/year
 * integers consistently with whichever calendar is currently displayed. */
export function getDisplayYear(gregorianMonth: number, gregorianYear: number, calendar: ResolvedCalendar): number {
  return calendar === 'jalali' ? getJalaliYear(gregorianMonth, gregorianYear) : gregorianYear;
}
