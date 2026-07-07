import { z } from 'zod';

import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

type RequestData = { id: number; reassignTo?: number };

const responseSchema = z.object({ success: z.boolean(), usageCount: z.number() });

type Response = z.infer<typeof responseSchema>;

const keyGenerator: MutationKeyGenerator = () => ['categories', 'delete'];

client.registerEndpoint<RequestData, Response>(keyGenerator, {
  url: (data) =>
    data.reassignTo ? `/api/categories/${data.id}?reassignTo=${data.reassignTo}` : `/api/categories/${data.id}`,
  method: 'DELETE',
  type: 'mutation',
  responseSchema,
  omitFromBody: ['id', 'reassignTo'],
});

export { keyGenerator as deleteCategoryKeyGenerator };
export type { RequestData as DeleteCategoryRequestData, Response as DeleteCategoryResponse };
