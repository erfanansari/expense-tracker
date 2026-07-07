import { z } from 'zod';

import { createIncomeSchema } from '@schemas';

import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

const requestDataSchema = createIncomeSchema.partial().extend({ id: z.number() });

type RequestData = z.infer<typeof requestDataSchema>;
const responseSchema = z.object({ message: z.string() });
type Response = z.infer<typeof responseSchema>;

const keyGenerator: MutationKeyGenerator = () => ['incomes', 'update'];

client.registerEndpoint<RequestData, Response>(keyGenerator, {
  url: (data) => `/api/incomes/${data.id}`,
  method: 'PUT',
  type: 'mutation',
  requestDataSchema,
  responseSchema,
  omitFromBody: ['id'],
});

export { keyGenerator as updateIncomeKeyGenerator };
export type { RequestData as UpdateIncomeRequestData };
