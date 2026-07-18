import { getMonthBucketKey, getWeekBucketKey } from '../index';

// Local-midnight construction avoids UTC parsing drift.
const d = (iso: string) => new Date(`${iso}T00:00:00`);

describe('getMonthBucketKey', () => {
  it('gregorian: buckets to the 1st of the Gregorian month', () => {
    expect(getMonthBucketKey(d('2026-02-28'), 'gregorian')).toBe('2026-02-01');
    expect(getMonthBucketKey(d('2026-02-01'), 'gregorian')).toBe('2026-02-01');
  });

  it('jalali: 2026-02-28 (9 Esfand 1404) buckets to Esfand, not Bahman', () => {
    // 1 Esfand 1404 = 2026-02-20
    expect(getMonthBucketKey(d('2026-02-28'), 'jalali')).toBe('2026-02-20');
  });

  it('jalali: 2026-02-19 (30 Bahman 1404) buckets to Bahman', () => {
    // 1 Bahman 1404 = 2026-01-21
    expect(getMonthBucketKey(d('2026-02-19'), 'jalali')).toBe('2026-01-21');
  });

  it('jalali: Nowruz day buckets to Farvardin', () => {
    // 1 Farvardin 1405 = 2026-03-21
    expect(getMonthBucketKey(d('2026-03-21'), 'jalali')).toBe('2026-03-21');
    expect(getMonthBucketKey(d('2026-04-19'), 'jalali')).toBe('2026-03-21');
  });
});

describe('getWeekBucketKey', () => {
  // 2026-05-18 is a Monday.
  it('gregorian weeks start on Sunday', () => {
    expect(getWeekBucketKey(d('2026-05-18'), 'gregorian')).toBe('2026-05-17');
  });

  it('jalali weeks start on Saturday', () => {
    expect(getWeekBucketKey(d('2026-05-18'), 'jalali')).toBe('2026-05-16');
  });

  it('a Saturday is its own jalali week start', () => {
    expect(getWeekBucketKey(d('2026-05-16'), 'jalali')).toBe('2026-05-16');
  });
});
