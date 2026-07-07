import { z } from 'zod';

import type { Category, CategoryWithUsage } from '@types';

import client from '@core/client';
import type { QueryKeyGenerator } from '@core/client/@types';

import { categorySchema } from './getExpenseListQuery';

export const CATEGORIES_SCOPE = ['categories'] as const;

const categoryWithUsageSchema = categorySchema.extend({ usage_count: z.number() });

const keyGenerator: QueryKeyGenerator = () => ['categories', 'list'];
const withUsageKeyGenerator: QueryKeyGenerator = () => ['categories', 'with-usage'];

client.registerEndpoint<void, Category[]>(keyGenerator, {
  url: '/api/categories',
  method: 'GET',
  responseSchema: z.array(categorySchema),
});

client.registerEndpoint<void, CategoryWithUsage[]>(withUsageKeyGenerator, {
  url: '/api/categories?includeUsage=true',
  method: 'GET',
  responseSchema: z.array(categoryWithUsageSchema),
});

export { keyGenerator as getCategoryListKeyGenerator, withUsageKeyGenerator as getCategoryListWithUsageKeyGenerator };
