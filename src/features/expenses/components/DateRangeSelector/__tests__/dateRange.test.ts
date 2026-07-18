import { filterExpensesByDateRange, getChartGranularity, getDateRangeFilter } from '../index';

// Local-timezone YYYY-MM-DD — `toISOString` shifts to UTC and drifts a day
const ISO = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

describe('getDateRangeFilter', () => {
  let fixedNow: Date;

  beforeEach(() => {
    // Freeze "today" to 2026-05-18 (a Monday) for deterministic math
    fixedNow = new Date(2026, 4, 18); // month is 0-indexed
    jest.useFakeTimers();
    jest.setSystemTime(fixedNow);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const expectRange = (range: Parameters<typeof getDateRangeFilter>[0], start: string, end: string) => {
    const f = getDateRangeFilter(range);
    if (!f) throw new Error(`expected non-null filter for ${range}`);
    expect(ISO(f.start)).toBe(start);
    expect(ISO(f.end)).toBe(end);
  };

  it('7D returns a 7-day window ending today', () => {
    expectRange('7D', '2026-05-12', '2026-05-18');
  });

  it('30D returns a 30-day window ending today', () => {
    expectRange('30D', '2026-04-19', '2026-05-18');
  });

  it('THIS_MONTH starts on the 1st of the current month', () => {
    expectRange('THIS_MONTH', '2026-05-01', '2026-05-18');
  });

  it('LAST_MONTH spans the entire previous month', () => {
    expectRange('LAST_MONTH', '2026-04-01', '2026-04-30');
  });

  it('YTD starts on Jan 1', () => {
    expectRange('YTD', '2026-01-01', '2026-05-18');
  });

  it('ALL_TIME returns null (no filter)', () => {
    expect(getDateRangeFilter('ALL_TIME')).toBeNull();
  });

  // 2026-05-18 = 28 Ordibehesht 1405. Jalali month/year boundaries:
  // 1 Ordibehesht 1405 = 2026-04-21, Farvardin 1405 = 2026-03-21..2026-04-20.
  describe('jalali calendar', () => {
    const expectJalaliRange = (range: Parameters<typeof getDateRangeFilter>[0], start: string, end: string) => {
      const f = getDateRangeFilter(range, 'jalali');
      if (!f) throw new Error(`expected non-null filter for ${range}`);
      expect(ISO(f.start)).toBe(start);
      expect(ISO(f.end)).toBe(end);
    };

    it('THIS_MONTH starts on the 1st of the current Jalali month', () => {
      expectJalaliRange('THIS_MONTH', '2026-04-21', '2026-05-18');
    });

    it('LAST_MONTH spans the entire previous Jalali month', () => {
      expectJalaliRange('LAST_MONTH', '2026-03-21', '2026-04-20');
    });

    it('YTD starts on 1 Farvardin', () => {
      expectJalaliRange('YTD', '2026-03-21', '2026-05-18');
    });

    it('relative windows are calendar-independent', () => {
      expectJalaliRange('7D', '2026-05-12', '2026-05-18');
      expectJalaliRange('30D', '2026-04-19', '2026-05-18');
    });
  });
});

describe('filterExpensesByDateRange', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 4, 18));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const expenses = [
    { date: '2026-05-18', amount: 1 },
    { date: '2026-05-12', amount: 2 },
    { date: '2026-05-11', amount: 3 },
    { date: '2026-04-19', amount: 4 },
    { date: '2026-04-18', amount: 5 },
    { date: '2025-12-31', amount: 6 },
  ];

  it('includes both boundary dates for 7D', () => {
    const result = filterExpensesByDateRange(expenses, '7D');
    expect(result.map((e) => e.date)).toEqual(['2026-05-18', '2026-05-12']);
  });

  it('30D includes the start boundary', () => {
    const result = filterExpensesByDateRange(expenses, '30D');
    expect(result.map((e) => e.date)).toContain('2026-04-19');
    expect(result.map((e) => e.date)).not.toContain('2026-04-18');
  });

  it('ALL_TIME returns the input untouched', () => {
    const result = filterExpensesByDateRange(expenses, 'ALL_TIME');
    expect(result).toEqual(expenses);
  });

  it('returns an empty array when no expenses fall in range', () => {
    expect(filterExpensesByDateRange([], '30D')).toEqual([]);
  });
});

describe('getChartGranularity', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 4, 18));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('7D → daily', () => {
    expect(getChartGranularity('7D')).toBe('daily');
  });

  it('30D → daily (boundary: 30 days <= 31)', () => {
    expect(getChartGranularity('30D')).toBe('daily');
  });

  it('YTD on May 18 (138 days) → weekly', () => {
    expect(getChartGranularity('YTD')).toBe('weekly');
  });

  it('ALL_TIME → monthly', () => {
    expect(getChartGranularity('ALL_TIME')).toBe('monthly');
  });
});
