import { z } from 'zod';

import { createAssetSchema, fallbackT } from '@schemas';

import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

const requestDataSchema = createAssetSchema(fallbackT).partial().extend({ id: z.number() });

type RequestData = z.infer<typeof requestDataSchema>;
const responseSchema = z.object({ message: z.string() });
type Response = z.infer<typeof responseSchema>;

const keyGenerator: MutationKeyGenerator = () => ['assets', 'update'];

client.registerEndpoint<RequestData, Response>(keyGenerator, {
  url: (data) => `/api/assets/${data.id}`,
  method: 'PUT',
  type: 'mutation',
  requestDataSchema,
  responseSchema,
  omitFromBody: ['id'],
});

export { keyGenerator as updateAssetKeyGenerator };
export type { RequestData as UpdateAssetRequestData };
