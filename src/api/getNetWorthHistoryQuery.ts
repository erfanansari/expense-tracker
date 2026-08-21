import { z } from 'zod';

import client from '@core/client';
import type { QueryKeyGenerator } from '@core/client/@types';

export const NET_WORTH_SCOPE = ['net-worth'] as const;

// A point carries the valuations that were current on its date, not a total:
// the client converts each at its own date so the chart and the assets page
// agree (see src/core/net-worth/history.ts).
const responseSchema = z.object({
  data: z.array(
    z.object({
      date: z.string(),
      items: z.array(
        z.object({
          assetId: z.number(),
          amount: z.number(),
          currency: z.string(),
          entryRate: z.number(),
          valuedAt: z.string(),
        })
      ),
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
