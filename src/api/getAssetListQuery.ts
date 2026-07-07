import { z } from 'zod';

import type { Asset } from '@types';

import client from '@core/client';
import type { QueryKeyGenerator } from '@core/client/@types';

export const ASSETS_SCOPE = ['assets'] as const;

export const assetSchema: z.ZodType<Asset> = z.object({
  id: z.number(),
  userId: z.number(),
  category: z.enum(['cash', 'crypto', 'commodity', 'vehicle', 'property', 'bank', 'investment']),
  name: z.string(),
  quantity: z.number(),
  unit: z.string().nullable(),
  unitValue: z.number().nullable(),
  amount: z.number(),
  currency: z.string(),
  entryRate: z.number(),
  notes: z.string().nullable(),
  lastValuedAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

type Response = Asset[];

const keyGenerator: QueryKeyGenerator = () => ['assets', 'list'];

client.registerEndpoint<void, Response>(keyGenerator, {
  url: '/api/assets',
  method: 'GET',
  responseSchema: z.array(assetSchema),
});

export { keyGenerator as getAssetListKeyGenerator };
export type { Response as GetAssetListResponse };
