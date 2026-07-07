import { z } from 'zod';

import type { Income } from '@types';

import client from '@core/client';
import type { QueryKeyGenerator } from '@core/client/@types';

export const INCOMES_SCOPE = ['incomes'] as const;

export const incomeSchema: z.ZodType<Income> = z.object({
  id: z.number(),
  userId: z.number(),
  amount: z.number(),
  currency: z.string(),
  entryRate: z.number(),
  month: z.number(),
  year: z.number(),
  incomeType: z.enum(['salary', 'freelance', 'investment', 'gift', 'other']),
  source: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

type Response = Income[];

const keyGenerator: QueryKeyGenerator = () => ['incomes', 'list'];

client.registerEndpoint<void, Response>(keyGenerator, {
  url: '/api/incomes',
  method: 'GET',
  responseSchema: z.array(incomeSchema),
});

export { keyGenerator as getIncomeListKeyGenerator };
export type { Response as GetIncomeListResponse };
