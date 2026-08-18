import { z } from 'zod';

import { createExpenseObjectSchema, fallbackT } from '@schemas';

import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

// The un-refined object schema: Zod rejects `.partial()` on a schema carrying
// refinements, and the cross-field endDate check isn't meaningful on a partial.
const requestDataSchema = createExpenseObjectSchema(fallbackT).partial().extend({ id: z.number() });

type RequestData = z.infer<typeof requestDataSchema>;
const responseSchema = z.object({ message: z.string() });
type Response = z.infer<typeof responseSchema>;

const keyGenerator: MutationKeyGenerator = () => ['expenses', 'update'];

client.registerEndpoint<RequestData, Response>(keyGenerator, {
  url: (data) => `/api/expenses/${data.id}`,
  method: 'PUT',
  type: 'mutation',
  requestDataSchema,
  responseSchema,
  omitFromBody: ['id'],
});

export { keyGenerator as updateExpenseKeyGenerator };
export type { RequestData as UpdateExpenseRequestData };
