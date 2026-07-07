import { z } from 'zod';

import client from '@core/client';
import type { QueryKeyGenerator } from '@core/client/@types';

import type { CurrencyPreferencesPayload } from '@stores/currency';

export const SETTINGS_SCOPE = ['settings'] as const;

export const currencyPreferencesSchema = z.object({
  primaryCurrency: z.string(),
  secondaryCurrency: z.string().nullable(),
  numberFormat: z.enum(['auto', 'compact', 'full']),
});

type Response = CurrencyPreferencesPayload;

const keyGenerator: QueryKeyGenerator = () => ['settings', 'currency'];

client.registerEndpoint<void, Response>(keyGenerator, {
  url: '/api/settings/currency',
  method: 'GET',
  responseSchema: currencyPreferencesSchema,
  staleTime: 5 * 60 * 1000,
});

export { keyGenerator as getCurrencyPreferencesKeyGenerator };
export type { Response as CurrencyPreferencesResponse };
