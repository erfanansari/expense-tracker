import { z } from 'zod';

import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

const requestDataSchema = z.object({ name: z.string().min(1, 'Name is required') });
const responseSchema = z.object({
  user: z.object({
    id: z.number(),
    email: z.string(),
    name: z.string().nullable(),
  }),
});

type RequestData = z.infer<typeof requestDataSchema>;
type Response = z.infer<typeof responseSchema>;

const keyGenerator: MutationKeyGenerator = () => ['user', 'profile-update'];

client.registerEndpoint<RequestData, Response>(keyGenerator, {
  url: '/api/user/profile',
  method: 'PUT',
  type: 'mutation',
  requestDataSchema,
  responseSchema,
});

export { keyGenerator as updateUserProfileKeyGenerator };
export type { RequestData as UpdateUserProfileRequestData };
