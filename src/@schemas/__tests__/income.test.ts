import { fallbackT } from '../fallback-translator';
import { createIncomeSchema } from '../income';

describe('createIncomeSchema', () => {
  const schema = createIncomeSchema(fallbackT);
  const validIncome = {
    amount: 3000,
    currency: 'USD',
    month: 6,
    year: 2024,
    incomeType: 'salary' as const,
  };

  it('accepts valid income data', () => {
    const result = schema.safeParse(validIncome);
    expect(result.success).toBe(true);
  });

  it('accepts income with optional fields', () => {
    const result = schema.safeParse({
      ...validIncome,
      source: 'Company XYZ',
      notes: 'Monthly salary',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid income type', () => {
    const result = schema.safeParse({ ...validIncome, incomeType: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('rejects month out of range', () => {
    expect(schema.safeParse({ ...validIncome, month: 0 }).success).toBe(false);
    expect(schema.safeParse({ ...validIncome, month: 13 }).success).toBe(false);
  });

  it('rejects negative amount', () => {
    const result = schema.safeParse({ ...validIncome, amount: -100 });
    expect(result.success).toBe(false);
  });
});
