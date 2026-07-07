import { z } from 'zod';

import type { Tag } from '@types';

import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

import { tagSchema } from './getExpenseListQuery';

const requestDataSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Name is required'),
});

type RequestData = z.infer<typeof requestDataSchema>;
type Response = Tag;

const keyGenerator: MutationKeyGenerator = () => ['tags', 'update'];

client.registerEndpoint<RequestData, Response>(keyGenerator, {
  url: (data) => `/api/tags/${data.id}`,
  method: 'PUT',
  type: 'mutation',
  requestDataSchema,
  responseSchema: tagSchema,
  omitFromBody: ['id'],
});

export { keyGenerator as updateTagKeyGenerator };
export type { RequestData as UpdateTagRequestData };
