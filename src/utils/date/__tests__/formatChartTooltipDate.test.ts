import { formatChartTooltipDate } from '../index';

describe('formatChartTooltipDate', () => {
  describe('daily granularity', () => {
    it('formats a daily ISO date as weekday + full date', () => {
      // 2026-05-02 is a Saturday
      expect(formatChartTooltipDate('2026-05-02', 'daily')).toBe('Sat, May 2, 2026');
    });

    it('handles single-digit days', () => {
      expect(formatChartTooltipDate('2026-01-09', 'daily')).toBe('Fri, Jan 9, 2026');
    });

    it('handles December dates', () => {
      expect(formatChartTooltipDate('2025-12-31', 'daily')).toBe('Wed, Dec 31, 2025');
    });
  });

  describe('weekly granularity', () => {
    it('prefixes the date with "Week of"', () => {
      expect(formatChartTooltipDate('2026-05-02', 'weekly')).toBe('Week of May 2, 2026');
    });

    it('works at the start of the year', () => {
      expect(formatChartTooltipDate('2026-01-01', 'weekly')).toBe('Week of Jan 1, 2026');
    });
  });

  describe('monthly granularity', () => {
    it('formats a yyyy-MM key as full month + year', () => {
      expect(formatChartTooltipDate('2026-05', 'monthly')).toBe('May 2026');
    });

    it('formats December correctly', () => {
      expect(formatChartTooltipDate('2025-12', 'monthly')).toBe('December 2025');
    });

    it('formats January correctly', () => {
      expect(formatChartTooltipDate('2026-01', 'monthly')).toBe('January 2026');
    });
  });
});
