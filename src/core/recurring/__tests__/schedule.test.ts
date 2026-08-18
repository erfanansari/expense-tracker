import type { RecurrenceRule } from '@/@types/recurring';

import { countOccurrencesBefore, dueOccurrences, isExhausted, nextDueDateFor, occurrenceAt } from '../schedule';

const rule = (overrides: Partial<RecurrenceRule> & Pick<RecurrenceRule, 'anchorDate'>): RecurrenceRule => ({
  frequency: 'monthly',
  intervalCount: 1,
  calendar: 'gregorian',
  endDate: null,
  ...overrides,
});

/** The first `count` occurrences, for asserting a whole sequence at once. */
const series = (r: RecurrenceRule, count: number) => Array.from({ length: count }, (_, n) => occurrenceAt(r, n));

describe('occurrenceAt — daily and weekly', () => {
  it('daily walks one day at a time and crosses a month boundary', () => {
    const r = rule({ anchorDate: '2026-01-30', frequency: 'daily' });
    expect(series(r, 4)).toEqual(['2026-01-30', '2026-01-31', '2026-02-01', '2026-02-02']);
  });

  it('daily honours intervalCount', () => {
    const r = rule({ anchorDate: '2026-01-01', frequency: 'daily', intervalCount: 10 });
    expect(series(r, 3)).toEqual(['2026-01-01', '2026-01-11', '2026-01-21']);
  });

  it('weekly keeps the same weekday', () => {
    // 2026-03-05 is a Thursday.
    const r = rule({ anchorDate: '2026-03-05', frequency: 'weekly' });
    expect(series(r, 3)).toEqual(['2026-03-05', '2026-03-12', '2026-03-19']);
  });

  it('weekly with intervalCount 2 is fortnightly', () => {
    const r = rule({ anchorDate: '2026-03-05', frequency: 'weekly', intervalCount: 2 });
    expect(series(r, 3)).toEqual(['2026-03-05', '2026-03-19', '2026-04-02']);
  });

  it('ignores the calendar for daily and weekly — a week is seven days either way', () => {
    const g = rule({ anchorDate: '2026-03-05', frequency: 'weekly', calendar: 'gregorian' });
    const j = rule({ anchorDate: '2026-03-05', frequency: 'weekly', calendar: 'jalali' });
    expect(series(j, 5)).toEqual(series(g, 5));
  });
});

describe('occurrenceAt — monthly, Gregorian', () => {
  it('holds the day of month', () => {
    const r = rule({ anchorDate: '2026-01-15' });
    expect(series(r, 4)).toEqual(['2026-01-15', '2026-02-15', '2026-03-15', '2026-04-15']);
  });

  it('clamps the 31st non-destructively — Feb is short, March is not', () => {
    // This is the regression the anchor+index model exists to prevent: a rolling
    // "add one month" would give 2026-03-28 here and drift off the 31st forever.
    const r = rule({ anchorDate: '2026-01-31' });
    expect(series(r, 5)).toEqual(['2026-01-31', '2026-02-28', '2026-03-31', '2026-04-30', '2026-05-31']);
  });

  it('lands on Feb 29 in a leap year', () => {
    // 2028 is a leap year; 2026 and 2027 are not.
    const r = rule({ anchorDate: '2026-01-29', frequency: 'yearly' });
    expect(series(r, 3)).toEqual(['2026-01-29', '2027-01-29', '2028-01-29']);

    const feb = rule({ anchorDate: '2028-02-29', frequency: 'yearly' });
    expect(series(feb, 3)).toEqual(['2028-02-29', '2029-02-28', '2030-02-28']);
  });

  it('rolls the year over', () => {
    const r = rule({ anchorDate: '2026-11-10' });
    expect(series(r, 4)).toEqual(['2026-11-10', '2026-12-10', '2027-01-10', '2027-02-10']);
  });

  it('honours intervalCount for quarterly', () => {
    const r = rule({ anchorDate: '2026-01-31', intervalCount: 3 });
    expect(series(r, 4)).toEqual(['2026-01-31', '2026-04-30', '2026-07-31', '2026-10-31']);
  });
});

describe('occurrenceAt — monthly, Jalali', () => {
  it('holds the Jalali day of month across Nowruz', () => {
    // 1 Farvardin 1405 = 2026-03-21. The next three Jalali months start on
    // 2026-04-21 (Ordibehesht), 2026-05-22 (Khordad), 2026-06-22 (Tir).
    const r = rule({ anchorDate: '2026-03-21', calendar: 'jalali' });
    expect(series(r, 4)).toEqual(['2026-03-21', '2026-04-21', '2026-05-22', '2026-06-22']);
  });

  it('differs from Gregorian monthly — the whole point of the per-rule calendar', () => {
    const j = rule({ anchorDate: '2026-03-21', calendar: 'jalali' });
    const g = rule({ anchorDate: '2026-03-21', calendar: 'gregorian' });
    expect(occurrenceAt(j, 1)).toBe('2026-04-21');
    expect(occurrenceAt(g, 1)).toBe('2026-04-21');
    // They agree for one month and then part ways: Jalali months are 31 days
    // through Shahrivar, so the 2nd occurrence slips a day relative to Gregorian.
    expect(occurrenceAt(j, 2)).toBe('2026-05-22');
    expect(occurrenceAt(g, 2)).toBe('2026-05-21');
  });

  it('clamps 31 Farvardin into the 30-day second half of the year', () => {
    // 31 Farvardin 1405 = 2026-04-20. Mehr (month 7) has 30 days, so the 6th
    // occurrence clamps to 30 Mehr rather than overflowing into Aban.
    const r = rule({ anchorDate: '2026-04-20', calendar: 'jalali' });
    const dates = series(r, 7);
    expect(dates[0]).toBe('2026-04-20'); // 31 Farvardin
    expect(dates[6]).toBe('2026-10-22'); // 30 Mehr — clamped from 31
    // And the clamp does not stick: month 12 of the same walk is unaffected by it.
    expect(occurrenceAt(r, 12)).toBe('2027-04-20'); // 31 Farvardin again
  });

  it('clamps 30 Esfand to 29 Esfand in a non-leap Jalali year', () => {
    // 1403 is a leap Jalali year, so 30 Esfand 1403 exists = 2025-03-20.
    // 1404 is not: Esfand has 29 days, so the yearly rule clamps.
    const r = rule({ anchorDate: '2025-03-20', frequency: 'yearly', calendar: 'jalali' });
    expect(occurrenceAt(r, 0)).toBe('2025-03-20'); // 30 Esfand 1403
    expect(occurrenceAt(r, 1)).toBe('2026-03-20'); // 29 Esfand 1404 — clamped
  });

  it('yearly Jalali returns to the same Jalali day', () => {
    const r = rule({ anchorDate: '2026-03-21', frequency: 'yearly', calendar: 'jalali' });
    // 1 Farvardin 1406 = 2027-03-21.
    expect(series(r, 2)).toEqual(['2026-03-21', '2027-03-21']);
  });
});

describe('occurrenceAt — guards', () => {
  it('treats index 0 and any negative index as the anchor', () => {
    const r = rule({ anchorDate: '2026-01-15' });
    expect(occurrenceAt(r, 0)).toBe('2026-01-15');
    expect(occurrenceAt(r, -3)).toBe('2026-01-15');
  });
});

describe('nextDueDateFor', () => {
  it('is the occurrence at the posted count', () => {
    const r = rule({ anchorDate: '2026-01-31' });
    expect(nextDueDateFor(r, 0)).toBe('2026-01-31');
    expect(nextDueDateFor(r, 2)).toBe('2026-03-31');
  });
});

describe('isExhausted', () => {
  it('is false while occurrences remain within the end date', () => {
    const r = rule({ anchorDate: '2026-01-15', endDate: '2026-03-31' });
    expect(isExhausted(r, 0)).toBe(false);
    expect(isExhausted(r, 2)).toBe(false); // 2026-03-15
  });

  it('is true once the next occurrence passes the end date', () => {
    const r = rule({ anchorDate: '2026-01-15', endDate: '2026-03-31' });
    expect(isExhausted(r, 3)).toBe(true); // 2026-04-15
  });

  it('is never true without an end date', () => {
    const r = rule({ anchorDate: '2026-01-15' });
    expect(isExhausted(r, 9999)).toBe(false);
  });
});

describe('countOccurrencesBefore', () => {
  it('is 0 when the rule has not started', () => {
    const r = rule({ anchorDate: '2026-06-01' });
    expect(countOccurrencesBefore(r, '2026-01-01')).toBe(0);
    expect(countOccurrencesBefore(r, '2026-06-01')).toBe(0); // anchor is not "before" itself
  });

  it('counts elapsed monthly occurrences', () => {
    const r = rule({ anchorDate: '2026-01-15' });
    expect(countOccurrencesBefore(r, '2026-01-16')).toBe(1);
    expect(countOccurrencesBefore(r, '2026-04-15')).toBe(3); // Jan, Feb, Mar
    expect(countOccurrencesBefore(r, '2026-04-16')).toBe(4);
  });

  it('counts elapsed daily occurrences over a long span', () => {
    const r = rule({ anchorDate: '2020-01-01', frequency: 'daily' });
    // 2020-01-01 .. 2020-12-31 inclusive is 366 days (2020 is a leap year).
    expect(countOccurrencesBefore(r, '2021-01-01')).toBe(366);
  });

  it('agrees with occurrenceAt at the boundary it returns', () => {
    const r = rule({ anchorDate: '2026-01-31' });
    const n = countOccurrencesBefore(r, '2026-05-01');
    expect(occurrenceAt(r, n - 1) < '2026-05-01').toBe(true);
    expect(occurrenceAt(r, n) >= '2026-05-01').toBe(true);
  });

  it('works on the Jalali calendar', () => {
    const r = rule({ anchorDate: '2026-03-21', calendar: 'jalali' });
    // Occurrences: 03-21, 04-21, 05-22, 06-22 ...
    expect(countOccurrencesBefore(r, '2026-05-22')).toBe(2);
    expect(countOccurrencesBefore(r, '2026-05-23')).toBe(3);
  });
});

// The expense the user saves *is* occurrence #0, so its rule starts at
// postedCount = 1. If that ever regresses to 0, saving a repeating expense
// would immediately post a second copy on the same date.
describe('an expense-anchored repeat', () => {
  it('does not re-post the expense that created it', () => {
    const r = rule({ anchorDate: '2026-08-18' });
    expect(dueOccurrences(r, 1, '2026-08-18', 500)).toEqual([]);
    expect(nextDueDateFor(r, 1)).toBe('2026-09-18');
  });

  it('still catches up occurrences missed since a backdated expense', () => {
    // Logged three months late: the two intervening months are genuinely owed.
    const r = rule({ anchorDate: '2026-05-18' });
    expect(dueOccurrences(r, 1, '2026-08-18', 500)).toEqual(['2026-06-18', '2026-07-18', '2026-08-18']);
  });

  it('posts nothing before the first interval has elapsed', () => {
    const r = rule({ anchorDate: '2026-08-18' });
    expect(dueOccurrences(r, 1, '2026-09-17', 500)).toEqual([]);
    expect(dueOccurrences(r, 1, '2026-09-18', 500)).toEqual(['2026-09-18']);
  });
});

describe('dueOccurrences', () => {
  it('is empty when nothing is due yet', () => {
    const r = rule({ anchorDate: '2026-06-01' });
    expect(dueOccurrences(r, 0, '2026-05-31', 500)).toEqual([]);
  });

  it('includes an occurrence falling exactly on today', () => {
    const r = rule({ anchorDate: '2026-06-01' });
    expect(dueOccurrences(r, 0, '2026-06-01', 500)).toEqual(['2026-06-01']);
  });

  it('catches up every missed occurrence in one pass', () => {
    const r = rule({ anchorDate: '2026-01-15' });
    expect(dueOccurrences(r, 0, '2026-04-20', 500)).toEqual(['2026-01-15', '2026-02-15', '2026-03-15', '2026-04-15']);
  });

  it('resumes from the posted count rather than re-posting history', () => {
    const r = rule({ anchorDate: '2026-01-15' });
    expect(dueOccurrences(r, 2, '2026-04-20', 500)).toEqual(['2026-03-15', '2026-04-15']);
  });

  it('stops at the end date even when today is well past it', () => {
    const r = rule({ anchorDate: '2026-01-15', endDate: '2026-02-28' });
    expect(dueOccurrences(r, 0, '2026-12-31', 500)).toEqual(['2026-01-15', '2026-02-15']);
  });

  it('respects the cap and leaves the remainder for the next run', () => {
    const r = rule({ anchorDate: '2026-01-01', frequency: 'daily' });
    const first = dueOccurrences(r, 0, '2026-12-31', 10);
    expect(first).toHaveLength(10);
    expect(first[0]).toBe('2026-01-01');
    expect(first[9]).toBe('2026-01-10');

    const second = dueOccurrences(r, 10, '2026-12-31', 10);
    expect(second[0]).toBe('2026-01-11');
  });

  it('catches up a Jalali monthly rule across Nowruz', () => {
    const r = rule({ anchorDate: '2026-01-21', calendar: 'jalali' }); // 1 Bahman 1404
    // 1 Bahman, 1 Esfand, 1 Farvardin 1405, 1 Ordibehesht.
    expect(dueOccurrences(r, 0, '2026-04-25', 500)).toEqual(['2026-01-21', '2026-02-20', '2026-03-21', '2026-04-21']);
  });
});
