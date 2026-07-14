import { z } from 'zod';

import { SUPPORTED_CURRENCY_CODES } from '@/constants/currencies';

import type { Translator } from './fallback-translator';

export const currencyCodeSchema = z.enum(SUPPORTED_CURRENCY_CODES as [string, ...string[]]);

export function createExpenseSchema(t: Translator) {
  return z.object({
    date: z.string().min(1, t('zod.expense.dateRequired')),
    categoryId: z.number().int().positive(t('zod.expense.categoryRequired')),
    description: z.string().min(1, t('zod.expense.descriptionRequired')),
    amount: z.number().min(0, t('zod.expense.amountNonNegative')),
    currency: currencyCodeSchema,
    tagIds: z.array(z.number().int()).optional(),
  });
}

export type CreateExpenseSchema = z.infer<ReturnType<typeof createExpenseSchema>>;
