import { z } from 'zod';

import client from '@core/client';
import type { QueryKeyGenerator } from '@core/client/@types';

export const NET_WORTH_SCOPE = ['net-worth'] as const;

const responseSchema = z.object({
  data: z.array(
    z.object({
      date: z.string(),
      /** Net worth in the pivot currency (IRT). */
      value: z.number(),
    })
  ),
});

type RequestData = { from: string; to: string };
type Response = z.infer<typeof responseSchema>;

const keyGenerator: QueryKeyGenerator<RequestData> = (data) => ['net-worth', 'history', data];

client.registerEndpoint<RequestData, Response>(keyGenerator, {
  url: '/api/net-worth/history',
  method: 'GET',
  responseSchema,
});

export { keyGenerator as getNetWorthHistoryKeyGenerator };
export type { RequestData as GetNetWorthHistoryRequestData, Response as NetWorthHistoryResponse };
