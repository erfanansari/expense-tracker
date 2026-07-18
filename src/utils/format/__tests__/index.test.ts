import { formatNumber, isPlausibleAmountInput, parseShorthandNumber } from '../index';

describe('parseShorthandNumber', () => {
  it('parses plain numbers', () => {
    expect(parseShorthandNumber('42')).toBe(42);
    expect(parseShorthandNumber('3.5')).toBe(3.5);
    expect(parseShorthandNumber('-17')).toBe(-17);
  });

  it('parses shorthand notation', () => {
    expect(parseShorthandNumber('4k')).toBe(4_000);
    expect(parseShorthandNumber('3.2m')).toBe(3_200_000);
    expect(parseShorthandNumber('1.5b')).toBe(1_500_000_000);
    expect(parseShorthandNumber('2T')).toBe(2_000_000_000_000);
    expect(parseShorthandNumber('4 k')).toBe(4_000);
  });

  it('normalizes Persian and Arabic digits', () => {
    expect(parseShorthandNumber('۱۲۳')).toBe(123);
    expect(parseShorthandNumber('٤٥٦')).toBe(456);
    expect(parseShorthandNumber('۴k')).toBe(4_000);
  });

  it('strips comma grouping from pasted formatted numbers', () => {
    // Previously parseFloat silently truncated "343,433" to 343.
    expect(parseShorthandNumber('343,433')).toBe(343_433);
    expect(parseShorthandNumber('-1,000')).toBe(-1_000);
    expect(parseShorthandNumber('1,234,567.89')).toBe(1_234_567.89);
  });

  it('strips Persian grouping and decimal separators', () => {
    expect(parseShorthandNumber('۳۴۳٬۴۳۳')).toBe(343_433);
    expect(parseShorthandNumber('۱٫۵')).toBe(1.5);
    expect(parseShorthandNumber('۱۲،۳۴۵')).toBe(12_345);
  });

  it('strips space grouping (regular, NBSP, narrow NBSP)', () => {
    expect(parseShorthandNumber('343 433')).toBe(343_433);
    expect(parseShorthandNumber('343\u00a0433')).toBe(343_433);
    expect(parseShorthandNumber('343\u202f433')).toBe(343_433);
  });

  it('documents the "1,2" trade-off: separators are grouping, not decimals', () => {
    expect(parseShorthandNumber('1,2')).toBe(12);
  });

  it('returns null for empty or invalid input', () => {
    expect(parseShorthandNumber('')).toBeNull();
    expect(parseShorthandNumber('   ')).toBeNull();
    expect(parseShorthandNumber('abc')).toBeNull();
    expect(parseShorthandNumber('12abc')).toBeNull();
    expect(parseShorthandNumber('1.2.3')).toBeNull();
  });

  it('accepts partial in-progress input via isPlausibleAmountInput', () => {
    for (const raw of ['', '-', '3.', '1,00', '۱۲', '4k', '4 k', '343,433', '۳۴۳٬۴۳۳']) {
      expect(isPlausibleAmountInput(raw)).toBe(true);
    }
  });

  it('rejects impossible amount characters via isPlausibleAmountInput', () => {
    for (const raw of ['abc', '12a', '1;2', 'x4k', '4kk', '12!']) {
      expect(isPlausibleAmountInput(raw)).toBe(false);
    }
  });

  it('round-trips formatted output back through the parser', () => {
    for (const n of [0, 1_500, 343_433, 9_876_543]) {
      expect(parseShorthandNumber(formatNumber(n, 'en'))).toBe(n);
      expect(parseShorthandNumber(formatNumber(n, 'fa'))).toBe(n);
    }
  });
});
