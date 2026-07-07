import { z } from 'zod';

import { createIncomeSchema } from '@schemas';
import type { CreateIncomeSchema } from '@schemas';

import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

type RequestData = CreateIncomeSchema;
const responseSchema = z.object({ message: z.string(), id: z.number() });
type Response = z.infer<typeof responseSchema>;

const keyGenerator: MutationKeyGenerator = () => ['incomes', 'create'];

client.registerEndpoint<RequestData, Response>(keyGenerator, {
  url: '/api/incomes',
  type: 'mutation',
  requestDataSchema: createIncomeSchema,
  responseSchema,
});

export { keyGenerator as createIncomeKeyGenerator };
export type { RequestData as CreateIncomeRequestData };
