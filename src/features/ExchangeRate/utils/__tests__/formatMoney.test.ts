import { formatMoney } from '../currency';

describe('formatMoney', () => {
  it('formats IRT with the Latin "IRT" suffix by default (en)', () => {
    expect(formatMoney(5717348, 'IRT')).toBe('5,717,348 IRT');
  });

  it('formats IRT with the تومان suffix in fa — the one currency whose fa symbol differs', () => {
    expect(formatMoney(5717348, 'IRT', { locale: 'fa' })).toBe('۵٬۷۱۷٬۳۴۸ تومان');
  });

  it('keeps universal symbols (USD) unchanged between locales', () => {
    expect(formatMoney(100, 'USD')).toBe('$100');
    expect(formatMoney(100, 'USD', { locale: 'fa' })).toBe('$۱۰۰');
  });

  it('keeps standard international codes (AED, CHF) unchanged in fa', () => {
    expect(formatMoney(50, 'AED', { locale: 'fa' })).toBe('AED۵۰');
    expect(formatMoney(50, 'CHF', { locale: 'fa' })).toBe('CHF۵۰');
  });

  it('respects compact notation with the correct fa symbol', () => {
    // Intl's fa-IR compact output separates the number from the compact unit
    // ("میلیارد") with a NBSP (U+00A0), not a regular space — build the
    // expectation from parts so the NBSP survives verbatim in source.
    expect(formatMoney(1730000000, 'IRT', { compact: true, locale: 'fa' })).toBe(`۱٫۷۳ میلیارد تومان`);
  });
});
