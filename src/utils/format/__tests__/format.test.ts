import { formatNumber } from '../index';

describe('formatNumber', () => {
  it('formats integers with commas', () => {
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(1000000)).toBe('1,000,000');
  });

  it('rounds decimals', () => {
    expect(formatNumber(1234.56)).toBe('1,235');
    expect(formatNumber(99.4)).toBe('99');
  });

  it('handles zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('handles negative numbers', () => {
    expect(formatNumber(-1500)).toBe('-1,500');
  });
});
