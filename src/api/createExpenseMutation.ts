import { z } from 'zod';

import { createExpenseSchema } from '@schemas';
import type { CreateExpenseSchema } from '@schemas';

import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

type RequestData = CreateExpenseSchema;
const responseSchema = z.object({ message: z.string(), id: z.number() });
type Response = z.infer<typeof responseSchema>;

const keyGenerator: MutationKeyGenerator = () => ['expenses', 'create'];

client.registerEndpoint<RequestData, Response>(keyGenerator, {
  url: '/api/expenses',
  type: 'mutation',
  requestDataSchema: createExpenseSchema,
  responseSchema,
});

export { keyGenerator as createExpenseKeyGenerator };
export type { RequestData as CreateExpenseRequestData };
