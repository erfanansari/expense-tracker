import { createExpenseSchema } from '../expense';

describe('createExpenseSchema', () => {
  const validExpense = {
    date: '2024-01-15',
    categoryId: 1,
    description: 'Lunch',
    price_toman: 150000,
    price_usd: 3.5,
  };

  it('accepts valid expense data', () => {
    const result = createExpenseSchema.safeParse(validExpense);
    expect(result.success).toBe(true);
  });

  it('accepts expense with tagIds', () => {
    const result = createExpenseSchema.safeParse({ ...validExpense, tagIds: [1, 2, 3] });
    expect(result.success).toBe(true);
  });

  it('rejects missing date', () => {
    const result = createExpenseSchema.safeParse({ ...validExpense, date: '' });
    expect(result.success).toBe(false);
  });

  it('rejects missing categoryId', () => {
    const { categoryId: _omit, ...withoutCategory } = validExpense;
    const result = createExpenseSchema.safeParse(withoutCategory);
    expect(result.success).toBe(false);
  });

  it('rejects zero categoryId', () => {
    const result = createExpenseSchema.safeParse({ ...validExpense, categoryId: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects missing description', () => {
    const result = createExpenseSchema.safeParse({ ...validExpense, description: '' });
    expect(result.success).toBe(false);
  });

  it('rejects negative prices', () => {
    const result = createExpenseSchema.safeParse({ ...validExpense, price_toman: -100 });
    expect(result.success).toBe(false);
  });
});
