import { formatAxisNumber, formatNumber } from '../index';

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

describe('formatAxisNumber', () => {
  it('rolls millions over to billions', () => {
    expect(formatAxisNumber(14_000_000_000)).toBe('14B');
    expect(formatAxisNumber(12_000_000_000)).toBe('12B');
  });

  it('formats thousands and millions', () => {
    expect(formatAxisNumber(900_000)).toBe('900K');
    expect(formatAxisNumber(1_500_000)).toBe('1.5M');
  });

  it('formats trillions', () => {
    expect(formatAxisNumber(2_300_000_000_000)).toBe('2.3T');
  });

  it('leaves small numbers as-is', () => {
    expect(formatAxisNumber(42)).toBe('42');
    expect(formatAxisNumber(0)).toBe('0');
  });
});
