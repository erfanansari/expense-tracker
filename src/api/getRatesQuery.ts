import { z } from 'zod';

import client from '@core/client';
import type { QueryKeyGenerator } from '@core/client/@types';

import type { LatestRates, RatesSeries } from '@features/ExchangeRate/utils/currency';

export const RATES_SCOPE = ['rates'] as const;

const ratePointSchema = z.object({ rateDate: z.string(), rate: z.number() });

const responseSchema = z.object({
  latest: z.record(z.string(), z.number()),
  series: z.record(z.string(), z.array(ratePointSchema)).optional(),
});

type Response = { latest: LatestRates; series?: RatesSeries };

const keyGenerator: QueryKeyGenerator = () => ['rates', 'history'];

client.registerEndpoint<void, Response>(keyGenerator, {
  url: '/api/rates?history=1',
  method: 'GET',
  responseSchema: responseSchema as z.ZodType<Response>,
});

export { keyGenerator as getRatesKeyGenerator };
export type { Response as RatesResponse };
