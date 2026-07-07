import { z } from 'zod';

import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

type RequestData = { id: number };

const responseSchema = z.object({ success: z.boolean(), usageCount: z.number() });

type Response = z.infer<typeof responseSchema>;

const keyGenerator: MutationKeyGenerator = () => ['tags', 'delete'];

client.registerEndpoint<RequestData, Response>(keyGenerator, {
  url: (data) => `/api/tags/${data.id}`,
  method: 'DELETE',
  type: 'mutation',
  responseSchema,
  omitFromBody: ['id'],
});

export { keyGenerator as deleteTagKeyGenerator };
export type { RequestData as DeleteTagRequestData, Response as DeleteTagResponse };
