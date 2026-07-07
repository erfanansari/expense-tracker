import { z } from 'zod';

import type { Category } from '@types';

import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

import { categorySchema } from './getExpenseListQuery';

const requestDataSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  icon: z.string().optional(),
  color: z.string().optional(),
});

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
