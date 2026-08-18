/**
 * Occurrence math for recurring expenses.
 *
 * Pure and dependency-free (beyond the Jalali conversion helpers), so the exact
 * same code runs on the server in the materializer and in the browser for the
 * form's live "next occurrence" preview. No clock reads, no I/O.
 *
 * ── Why anchor + index, and not a rolling "add one month" ──────────────────
 * Every occurrence is computed from the anchor as `anchor + n periods`, never by
 * stepping forward from the previous occurrence. The month-end clamp is lossy:
 * stepping Jan 31 → Feb 28 and then adding a month again gives Mar 28, and the
 * rule has silently drifted off the 31st forever. Recomputing from the anchor
 * gives Jan 31 → Feb 28 → Mar 31, which is what "monthly on the 31st" means.
 */
import { addJalaliMonths, gregorianToJalali, jalaliToGregorian } from '@utils';

import type { RecurrenceRule } from '@/@types/recurring';

/** Parse yyyy-MM-dd to a *local* midnight Date. `new Date(iso)` would parse as
 * UTC and shift the day for anyone west of Greenwich; jalaali-js reads local
 * date parts, so local construction is what keeps the two consistent. */
export function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Format a local Date as yyyy-MM-dd. */
export function formatIsoDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Days in a Gregorian month. `month` is 1-indexed; day 0 of the next month is
 * the last day of this one. */
function gregorianMonthLength(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function addDays(iso: string, days: number): string {
  const date = parseIsoDate(iso);
  date.setDate(date.getDate() + days);
  return formatIsoDate(date);
}

/** Anchor + `months` Gregorian months, clamping the day into the target month. */
function addGregorianMonths(iso: string, months: number): string {
  const [year, month, day] = iso.split('-').map(Number);
  const total = month - 1 + months;
  const targetYear = year + Math.floor(total / 12);
  // `total` can be negative in principle; % in JS keeps the sign, so normalize.
  const targetMonth = (((total % 12) + 12) % 12) + 1;
  const clampedDay = Math.min(day, gregorianMonthLength(targetYear, targetMonth));
  return formatIsoDate(new Date(targetYear, targetMonth - 1, clampedDay));
}

/** Anchor + `months` Jalali months, clamping the day into the target month.
 * Handles 31→30 (Mehr onward) and 30 Esfand in a non-leap year. */
function addJalaliMonthsIso(iso: string, months: number): string {
  const j = gregorianToJalali(parseIsoDate(iso));
  const next = addJalaliMonths(j.year, j.month, j.day, months);
  return formatIsoDate(jalaliToGregorian(next.year, next.month, next.day));
}

/**
 * The nth occurrence of a rule as yyyy-MM-dd. `n = 0` is the anchor itself.
 *
 * `calendar` is honoured only for monthly/yearly — a week is seven days and a
 * day is a day in both systems, so applying it there would be meaningless.
 */
export function occurrenceAt(rule: RecurrenceRule, n: number): string {
  if (n <= 0) return rule.anchorDate;

  const steps = n * rule.intervalCount;

  switch (rule.frequency) {
    case 'daily':
      return addDays(rule.anchorDate, steps);
    case 'weekly':
      return addDays(rule.anchorDate, steps * 7);
    case 'monthly':
      return rule.calendar === 'jalali'
        ? addJalaliMonthsIso(rule.anchorDate, steps)
        : addGregorianMonths(rule.anchorDate, steps);
    case 'yearly':
      return rule.calendar === 'jalali'
        ? addJalaliMonthsIso(rule.anchorDate, steps * 12)
        : addGregorianMonths(rule.anchorDate, steps * 12);
  }
}

/** True once the rule's end date has been passed by occurrence `n`. */
export function isExhausted(rule: RecurrenceRule, n: number): boolean {
  return rule.endDate !== null && rule.endDate !== undefined && occurrenceAt(rule, n) > rule.endDate;
}

/**
 * The date a rule is next due, given how many occurrences it has already posted.
 * This is the single definition of `nextDueDate`; the DB column is a denormalized
 * copy of it, kept only so "is anything due?" can be one indexed query.
 */
export function nextDueDateFor(rule: RecurrenceRule, postedCount: number): string {
  return occurrenceAt(rule, postedCount);
}

// Ceiling for the exponential probe in countOccurrencesBefore — ~4M occurrences
// is far beyond any real rule (a daily rule would need >11,000 years) and stops
// a pathological input from spinning.
const MAX_OCCURRENCE_INDEX = 1 << 22;

/**
 * How many occurrences fall strictly before `isoDate`.
 *
 * Used to re-baseline a rule when its schedule is edited: setting `postedCount`
 * to this value means the new schedule picks up from today rather than
 * retroactively posting a history that never happened.
 *
 * Occurrences increase monotonically, so this is an exponential probe followed by
 * a binary search — O(log n) rather than walking every occurrence.
 */
export function countOccurrencesBefore(rule: RecurrenceRule, isoDate: string): number {
  if (occurrenceAt(rule, 0) >= isoDate) return 0;

  let hi = 1;
  while (occurrenceAt(rule, hi) < isoDate) {
    hi *= 2;
    if (hi > MAX_OCCURRENCE_INDEX) return MAX_OCCURRENCE_INDEX;
  }

  let lo = 0;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (occurrenceAt(rule, mid) < isoDate) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/**
 * Every occurrence date owed as of `today` (inclusive), starting from
 * `postedCount`. Empty when the rule isn't due, has run past its end date, or
 * hasn't started yet.
 *
 * `cap` bounds a single run so a long-dormant daily rule can't flood the ledger
 * in one pass; the remainder is picked up next time.
 */
export function dueOccurrences(rule: RecurrenceRule, postedCount: number, today: string, cap: number): string[] {
  const due: string[] = [];

  for (let n = postedCount; due.length < cap; n += 1) {
    const date = occurrenceAt(rule, n);
    if (date > today) break;
    if (rule.endDate && date > rule.endDate) break;
    due.push(date);
  }

  return due;
}
