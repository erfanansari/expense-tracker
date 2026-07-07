import { z } from 'zod';

import client from '@core/client';
import type { QueryKeyGenerator } from '@core/client/@types';

export const SUMMARY_SCOPE = ['summary'] as const;

/** A total already converted server-side, per-record at each record's date. */
const summaryPairSchema = z.object({
  primary: z.number(),
  secondary: z.number().nullable(),
});

export type SummaryPair = z.infer<typeof summaryPairSchema>;

const responseSchema = z.object({
  primaryCurrency: z.string(),
  secondaryCurrency: z.string().nullable(),
  total_income: summaryPairSchema,
  total_expenses: summaryPairSchema,
  net_worth: summaryPairSchema,
});

type Response = z.infer<typeof responseSchema>;

const keyGenerator: QueryKeyGenerator = () => ['summary', 'overview'];

client.registerEndpoint<void, Response>(keyGenerator, {
  url: '/api/summary',
  method: 'GET',
  responseSchema,
});

export { keyGenerator as getSummaryKeyGenerator };
export type { Response as SummaryData };
