import { z } from 'zod';

import { createAssetSchema, fallbackT } from '@schemas';
import type { CreateAssetSchema } from '@schemas';

import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

type RequestData = CreateAssetSchema;
const responseSchema = z.object({ message: z.string(), id: z.number() });
type Response = z.infer<typeof responseSchema>;

const keyGenerator: MutationKeyGenerator = () => ['assets', 'create'];

client.registerEndpoint<RequestData, Response>(keyGenerator, {
  url: '/api/assets',
  type: 'mutation',
  requestDataSchema: createAssetSchema(fallbackT),
  responseSchema,
});

export { keyGenerator as createAssetKeyGenerator };
export type { RequestData as CreateAssetRequestData };
