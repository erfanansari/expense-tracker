import { z } from 'zod';

import { createContactSchema, fallbackT } from '@schemas';
import type { ContactSchema } from '@schemas';

import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

type RequestData = ContactSchema;
type Response = z.infer<typeof responseSchema>;

const responseSchema = z.object({ status: z.boolean() });

const keyGenerator: MutationKeyGenerator = () => ['contact', 'send'];

client.registerEndpoint<RequestData, Response>(keyGenerator, {
  url: '/api/contact',
  type: 'mutation',
  requestDataSchema: createContactSchema(fallbackT),
  responseSchema,
  skipUnauthorizedHandling: true,
});

export { keyGenerator as sendContactKeyGenerator };
export type { RequestData as SendContactRequestData, Response as SendContactResponse };
