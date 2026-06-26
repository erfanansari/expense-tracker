import { z } from 'zod';

import { currencyCodeSchema } from './expense';

const incomeTypeEnum = z.enum(['salary', 'freelance', 'investment', 'gift', 'other']);

export const createIncomeSchema = z.object({
  amount: z.number().min(0, 'Amount must be non-negative'),
  currency: currencyCodeSchema,
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
  incomeType: incomeTypeEnum,
  source: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateIncomeSchema = z.infer<typeof createIncomeSchema>;
