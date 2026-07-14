import { getJalaliYear } from '../index';

describe('getJalaliYear', () => {
  it('maps a mid-year Gregorian month to the expected Jalali year', () => {
    // June 2026 (anchored on the 15th) falls in Jalali 1405.
    expect(getJalaliYear(6, 2026)).toBe(1405);
  });

  it('maps January/February to the previous Jalali year (before Nowruz)', () => {
    // Nowruz 1405 lands on 2026-03-21, so Jan/Feb 2026 are still Jalali 1404.
    expect(getJalaliYear(1, 2026)).toBe(1404);
    expect(getJalaliYear(2, 2026)).toBe(1404);
  });

  it('maps March and April to different Jalali years around Nowruz', () => {
    // March 15, 2026 is before Nowruz (still 1404); April 15, 2026 is after (1405).
    expect(getJalaliYear(3, 2026)).toBe(1404);
    expect(getJalaliYear(4, 2026)).toBe(1405);
  });
});
