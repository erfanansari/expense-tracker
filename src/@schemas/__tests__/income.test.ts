import { createIncomeSchema } from '../income';

describe('createIncomeSchema', () => {
  const validIncome = {
    amountUsd: 3000,
    amountToman: 390000000,
    exchangeRateUsed: 130000,
    month: 6,
    year: 2024,
    incomeType: 'salary' as const,
  };

  it('accepts valid income data', () => {
    const result = createIncomeSchema.safeParse(validIncome);
    expect(result.success).toBe(true);
  });

  it('accepts income with optional fields', () => {
    const result = createIncomeSchema.safeParse({
      ...validIncome,
      source: 'Company XYZ',
      notes: 'Monthly salary',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid income type', () => {
    const result = createIncomeSchema.safeParse({ ...validIncome, incomeType: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('rejects month out of range', () => {
    expect(createIncomeSchema.safeParse({ ...validIncome, month: 0 }).success).toBe(false);
    expect(createIncomeSchema.safeParse({ ...validIncome, month: 13 }).success).toBe(false);
  });

  it('rejects negative amounts', () => {
    const result = createIncomeSchema.safeParse({ ...validIncome, amountUsd: -100 });
    expect(result.success).toBe(false);
  });
});
