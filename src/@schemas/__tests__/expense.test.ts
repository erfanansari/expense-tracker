import { createExpenseObjectSchema, createExpenseSchema } from '../expense';
import { fallbackT } from '../fallback-translator';

describe('createExpenseSchema', () => {
  const schema = createExpenseSchema(fallbackT);
  const validExpense = {
    date: '2024-01-15',
    categoryId: 1,
    description: 'Lunch',
    amount: 150000,
    currency: 'IRT',
  };

  it('accepts valid expense data', () => {
    const result = schema.safeParse(validExpense);
    expect(result.success).toBe(true);
  });

  it('accepts expense with tagIds', () => {
    const result = schema.safeParse({ ...validExpense, tagIds: [1, 2, 3] });
    expect(result.success).toBe(true);
  });

  it('rejects missing date', () => {
    const result = schema.safeParse({ ...validExpense, date: '' });
    expect(result.success).toBe(false);
  });

  it('rejects missing categoryId', () => {
    const { categoryId: _omit, ...withoutCategory } = validExpense;
    const result = schema.safeParse(withoutCategory);
    expect(result.success).toBe(false);
  });

  it('rejects zero categoryId', () => {
    const result = schema.safeParse({ ...validExpense, categoryId: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects missing description', () => {
    const result = schema.safeParse({ ...validExpense, description: '' });
    expect(result.success).toBe(false);
  });

  it('rejects negative amount', () => {
    const result = schema.safeParse({ ...validExpense, amount: -100 });
    expect(result.success).toBe(false);
  });

  it('rejects unsupported currency', () => {
    const result = schema.safeParse({ ...validExpense, currency: 'JPY' });
    expect(result.success).toBe(false);
  });
});

describe('repeat', () => {
  const schema = createExpenseSchema(fallbackT);
  const base = {
    date: '2026-08-18',
    categoryId: 1,
    description: 'Rent',
    amount: 5000000,
    currency: 'IRT',
  };
  const monthly = { frequency: 'monthly', intervalCount: 1, calendar: 'jalali', endDate: null };

  it('accepts an expense with no repeat', () => {
    expect(schema.safeParse(base).success).toBe(true);
    expect(schema.safeParse({ ...base, repeat: null }).success).toBe(true);
  });

  it('accepts a valid repeat', () => {
    expect(schema.safeParse({ ...base, repeat: monthly }).success).toBe(true);
  });

  it('rejects an interval below 1 or above the cap', () => {
    expect(schema.safeParse({ ...base, repeat: { ...monthly, intervalCount: 0 } }).success).toBe(false);
    expect(schema.safeParse({ ...base, repeat: { ...monthly, intervalCount: 100 } }).success).toBe(false);
  });

  it('rejects an unknown frequency or calendar', () => {
    expect(schema.safeParse({ ...base, repeat: { ...monthly, frequency: 'hourly' } }).success).toBe(false);
    expect(schema.safeParse({ ...base, repeat: { ...monthly, calendar: 'hijri' } }).success).toBe(false);
  });

  it('rejects an end date before the expense date', () => {
    const result = schema.safeParse({ ...base, repeat: { ...monthly, endDate: '2026-08-17' } });
    expect(result.success).toBe(false);
  });

  it('accepts an end date on or after the expense date', () => {
    expect(schema.safeParse({ ...base, repeat: { ...monthly, endDate: '2026-08-18' } }).success).toBe(true);
    expect(schema.safeParse({ ...base, repeat: { ...monthly, endDate: '2027-01-01' } }).success).toBe(true);
  });
});

// Regression: the cross-field endDate check made createExpenseSchema a refined
// schema, and Zod throws on `.partial()` of one. That broke updateExpenseMutation
// at module evaluation — invisible to typecheck, tests and `next build`, and only
// surfaced as a runtime error in the browser. Hence both assertions here.
describe('createExpenseObjectSchema', () => {
  it('supports .partial() so update mutations can build a patch schema', () => {
    expect(() => createExpenseObjectSchema(fallbackT).partial()).not.toThrow();
  });

  it('lets every endpoint module evaluate without throwing', async () => {
    await expect(import('@api/updateExpenseMutation')).resolves.toBeDefined();
    await expect(import('@api/createExpenseMutation')).resolves.toBeDefined();
  });
});
