import { formatMoney } from '../currency';

describe('formatMoney', () => {
  it('formats IRT with the Latin "IRT" suffix by default (en)', () => {
    expect(formatMoney(5717348, 'IRT')).toBe('5,717,348 IRT');
  });

  it('formats IRT with the تومان suffix in fa — the one currency whose fa symbol differs', () => {
    expect(formatMoney(5717348, 'IRT', { locale: 'fa' })).toBe('۵٬۷۱۷٬۳۴۸ تومان');
  });

  it('keeps universal symbols (USD) unchanged in en', () => {
    expect(formatMoney(100, 'USD')).toBe('$100');
  });

  it('prepends a bidi mark (U+200E) before a prefix symbol in fa, invisibly', () => {
    // The visible characters are identical to en's "$100" — only an LRM is added.
    expect(formatMoney(100, 'USD', { locale: 'fa' })).toBe('‎$۱۰۰');
  });

  it('adds a space before plain multi-letter prefix codes (AED, CHF) in both locales', () => {
    // Native convention (both en and fa): "AED 50.00", not "AED50.00".
    expect(formatMoney(50, 'AED')).toBe('AED 50');
    expect(formatMoney(50, 'CHF')).toBe('CHF 50');
    expect(formatMoney(50, 'AED', { locale: 'fa' })).toBe('‎AED ۵۰');
    expect(formatMoney(50, 'CHF', { locale: 'fa' })).toBe('‎CHF ۵۰');
  });

  it('keeps single-glyph prefix symbols ($, C$, A$) glued to the number, no space', () => {
    expect(formatMoney(500, 'CAD')).toBe('C$500');
    expect(formatMoney(500, 'AUD')).toBe('A$500');
  });

  it('keeps up to 2 decimal digits of precision on compact amounts, in both locales', () => {
    expect(formatMoney(1730000000, 'IRT', { compact: true })).toBe('1.73B IRT');
    // Intl's fa-IR compact output separates the number from the compact unit
    // ("میلیارد") with a NBSP (U+00A0), not a regular space.
    expect(formatMoney(1730000000, 'IRT', { compact: true, locale: 'fa' })).toBe('۱٫۷۳ میلیارد تومان');
  });

  it('bidi-marks a compact prefix-symbol amount in fa (the GBP net-worth-card case)', () => {
    expect(formatMoney(46310, 'GBP', { compact: true, locale: 'fa' })).toBe('‎£۴۶٫۳۱ هزار');
  });
});
