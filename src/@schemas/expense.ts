import { z } from 'zod';

import { SUPPORTED_CURRENCY_CODES } from '@/constants/currencies';

export const currencyCodeSchema = z.enum(SUPPORTED_CURRENCY_CODES as [string, ...string[]]);

export const createExpenseSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  categoryId: z.number().int().positive('Category is required'),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0, 'Amount must be non-negative'),
  currency: currencyCodeSchema,
  tagIds: z.array(z.number().int()).optional(),
});

export type CreateExpenseSchema = z.infer<typeof createExpenseSchema>;
