import { z } from 'zod';

const incomeTypeEnum = z.enum(['salary', 'freelance', 'investment', 'gift', 'other']);

export const createIncomeSchema = z.object({
  amountUsd: z.number().min(0, 'Amount must be non-negative'),
  amountToman: z.number().min(0, 'Amount must be non-negative'),
  exchangeRateUsed: z.number().min(1, 'Exchange rate must be positive'),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
  incomeType: incomeTypeEnum,
  source: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateIncomeSchema = z.infer<typeof createIncomeSchema>;
