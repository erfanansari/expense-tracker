import { z } from 'zod';

import type { Category } from '@types';

import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

import { categorySchema } from './getExpenseListQuery';

const requestDataSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  sort_order: z.number().optional(),
});

type RequestData = z.infer<typeof requestDataSchema>;
type Response = Category;

const keyGenerator: MutationKeyGenerator = () => ['categories', 'update'];

client.registerEndpoint<RequestData, Response>(keyGenerator, {
  url: (data) => `/api/categories/${data.id}`,
  method: 'PUT',
  type: 'mutation',
  requestDataSchema,
  responseSchema: categorySchema,
  omitFromBody: ['id'],
});

export { keyGenerator as updateCategoryKeyGenerator };
export type { RequestData as UpdateCategoryRequestData };
