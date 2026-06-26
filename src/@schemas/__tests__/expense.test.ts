import { createExpenseSchema } from '../expense';

describe('createExpenseSchema', () => {
  const validExpense = {
    date: '2024-01-15',
    categoryId: 1,
    description: 'Lunch',
    amount: 150000,
    currency: 'IRT',
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

  it('rejects negative amount', () => {
    const result = createExpenseSchema.safeParse({ ...validExpense, amount: -100 });
    expect(result.success).toBe(false);
  });

  it('rejects unsupported currency', () => {
    const result = createExpenseSchema.safeParse({ ...validExpense, currency: 'JPY' });
    expect(result.success).toBe(false);
  });
});
