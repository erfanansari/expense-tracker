import {
  addJalaliMonths,
  gregorianToJalali,
  isLeapJalaaliYear,
  jalaaliMonthLength,
  jalaliToGregorian,
} from '../jalali-calendar';

describe('gregorianToJalali', () => {
  it('converts a known reference date', () => {
    // 2016-04-11 (Gregorian) is 1395-01-23 (Jalali) — the reference example
    // from jalaali-js's own docs.
    expect(gregorianToJalali(new Date(2016, 3, 11))).toEqual({ year: 1395, month: 1, day: 23 });
  });

  it('round-trips through jalaliToGregorian', () => {
    const jalali = gregorianToJalali(new Date(2026, 6, 13));
    const back = jalaliToGregorian(jalali.year, jalali.month, jalali.day);
    expect(back.getFullYear()).toBe(2026);
    expect(back.getMonth()).toBe(6);
    expect(back.getDate()).toBe(13);
  });
});

describe('jalaliToGregorian', () => {
  it('converts a known reference date', () => {
    const date = jalaliToGregorian(1395, 1, 23);
    expect(date.getFullYear()).toBe(2016);
    expect(date.getMonth()).toBe(3); // 0-indexed: April
    expect(date.getDate()).toBe(11);
  });
});

describe('jalaaliMonthLength', () => {
  it('returns 29 for Esfand in a common year', () => {
    expect(jalaaliMonthLength(1394, 12)).toBe(29);
  });

  it('returns 30 for Esfand in a leap year', () => {
    expect(jalaaliMonthLength(1395, 12)).toBe(30);
  });

  it('returns 31 for the first six months', () => {
    expect(jalaaliMonthLength(1404, 1)).toBe(31);
    expect(jalaaliMonthLength(1404, 6)).toBe(31);
  });

  it('returns 30 for months 7-11', () => {
    expect(jalaaliMonthLength(1404, 7)).toBe(30);
    expect(jalaaliMonthLength(1404, 11)).toBe(30);
  });
});

describe('isLeapJalaaliYear', () => {
  it('identifies 1395 as leap', () => {
    expect(isLeapJalaaliYear(1395)).toBe(true);
  });

  it('identifies 1394 as common', () => {
    expect(isLeapJalaaliYear(1394)).toBe(false);
  });
});

describe('addJalaliMonths', () => {
  it('advances within the same year', () => {
    expect(addJalaliMonths(1404, 4, 15, 1)).toEqual({ year: 1404, month: 5, day: 15 });
  });

  it('wraps into the next year', () => {
    expect(addJalaliMonths(1404, 12, 10, 1)).toEqual({ year: 1405, month: 1, day: 10 });
  });

  it('wraps into the previous year going backward', () => {
    expect(addJalaliMonths(1405, 1, 10, -1)).toEqual({ year: 1404, month: 12, day: 10 });
  });

  it('clamps the day when the destination month is shorter', () => {
    // Farvardin (month 1) has 31 days; moving 6 months forward lands on
    // Mehr (month 7), which only has 30.
    expect(addJalaliMonths(1404, 1, 31, 6)).toEqual({ year: 1404, month: 7, day: 30 });
  });
});
