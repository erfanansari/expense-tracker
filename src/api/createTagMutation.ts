import { z } from 'zod';

import type { Tag } from '@types';

import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

import { tagSchema } from './getExpenseListQuery';

const requestDataSchema = z.object({ name: z.string().min(1, 'Name is required') });

type RequestData = z.infer<typeof requestDataSchema>;
type Response = Tag;

const keyGenerator: MutationKeyGenerator = () => ['tags', 'create'];

client.registerEndpoint<RequestData, Response>(keyGenerator, {
  url: '/api/tags',
  type: 'mutation',
  requestDataSchema,
  responseSchema: tagSchema,
});

export { keyGenerator as createTagKeyGenerator };
export type { RequestData as CreateTagRequestData };
