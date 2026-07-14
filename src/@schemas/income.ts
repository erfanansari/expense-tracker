import { z } from 'zod';

import { currencyCodeSchema } from './expense';
import type { Translator } from './fallback-translator';

const incomeTypeEnum = z.enum(['salary', 'freelance', 'investment', 'gift', 'other']);

export function createIncomeSchema(t: Translator) {
  return z.object({
    amount: z.number().min(0, t('zod.income.amountNonNegative')),
    currency: currencyCodeSchema,
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(2000).max(2100),
    incomeType: incomeTypeEnum,
    source: z.string().optional(),
    notes: z.string().optional(),
  });
}

export type CreateIncomeSchema = z.infer<ReturnType<typeof createIncomeSchema>>;
