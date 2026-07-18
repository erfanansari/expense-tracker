import type { z } from 'zod';

import type { Category } from '@types';

import { createCategorySchema, fallbackT } from '@schemas';

import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

import { categorySchema } from './getExpenseListQuery';

const requestDataSchema = createCategorySchema(fallbackT);

type RequestData = z.infer<typeof requestDataSchema>;
type Response = Category;

const keyGenerator: MutationKeyGenerator = () => ['categories', 'create'];

client.registerEndpoint<RequestData, Response>(keyGenerator, {
  url: '/api/categories',
  type: 'mutation',
  requestDataSchema,
  responseSchema: categorySchema,
});

export { keyGenerator as createCategoryKeyGenerator };
export type { RequestData as CreateCategoryRequestData };
