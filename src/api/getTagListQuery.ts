import { z } from 'zod';

import type { Tag, TagWithUsage } from '@types';

import client from '@core/client';
import type { QueryKeyGenerator } from '@core/client/@types';

import { tagSchema } from './getExpenseListQuery';

export const TAGS_SCOPE = ['tags'] as const;

const tagWithUsageSchema = tagSchema.extend({ usage_count: z.number() });

const keyGenerator: QueryKeyGenerator = () => ['tags', 'list'];
const withUsageKeyGenerator: QueryKeyGenerator = () => ['tags', 'with-usage'];

client.registerEndpoint<void, Tag[]>(keyGenerator, {
  url: '/api/tags',
  method: 'GET',
  responseSchema: z.array(tagSchema),
});

client.registerEndpoint<void, TagWithUsage[]>(withUsageKeyGenerator, {
  url: '/api/tags?includeUsage=true',
  method: 'GET',
  responseSchema: z.array(tagWithUsageSchema),
});

export { keyGenerator as getTagListKeyGenerator, withUsageKeyGenerator as getTagListWithUsageKeyGenerator };
