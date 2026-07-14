import {
  isLeapJalaaliYear as isLeapJalaaliYearLib,
  jalaaliMonthLength as jalaaliMonthLengthLib,
  jalaaliToDateObject,
  toJalaali,
} from 'jalaali-js';

/** A day-level Jalali (Persian) calendar date. `month` is 1-indexed (1 = Farvardin). */
export interface JalaliDate {
  year: number;
  month: number;
  day: number;
}

/** The 12 Jalali month names, in order (index 0 = Farvardin). */
export const JALALI_MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
] as const;

const jalaliDigitsFormatter = new Intl.NumberFormat('fa-IR', { useGrouping: false });
/** Format a plain integer (year, day, ...) with Persian digits and no grouping —
 * for rendering inside a Jalali calendar/date UI. */
export function formatJalaliDigits(value: number): string {
  return jalaliDigitsFormatter.format(value);
}

/** Gregorian `Date` (local time) -> Jalali calendar date. */
export function gregorianToJalali(date: Date): JalaliDate {
  const { jy, jm, jd } = toJalaali(date);
  return { year: jy, month: jm, day: jd };
}

/** Jalali calendar date -> Gregorian `Date` (local time, midnight). */
export function jalaliToGregorian(year: number, month: number, day: number): Date {
  return jalaaliToDateObject(year, month, day);
}

/** Number of days in a Jalali month (29-31; Esfand is 29 or 30 depending on leap year). */
export function jalaaliMonthLength(year: number, month: number): number {
  return jalaaliMonthLengthLib(year, month);
}

/** Whether a Jalali year is leap (366 days, Esfand has 30 days). */
export function isLeapJalaaliYear(year: number): boolean {
  return isLeapJalaaliYearLib(year);
}

/** Add (or subtract, for negative `delta`) whole Jalali months, clamping the day
 * into the destination month so day=31 in a 31-day month safely becomes the
 * last day of a shorter destination month instead of overflowing. */
export function addJalaliMonths(year: number, month: number, day: number, delta: number): JalaliDate {
  const totalMonths = year * 12 + (month - 1) + delta;
  const nextYear = Math.floor(totalMonths / 12);
  const nextMonth = (totalMonths % 12) + 1;
  const clampedDay = Math.min(day, jalaaliMonthLengthLib(nextYear, nextMonth));
  return { year: nextYear, month: nextMonth, day: clampedDay };
}
