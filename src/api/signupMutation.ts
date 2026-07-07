import { z } from 'zod';

import { signupSchema } from '@schemas';
import type { SignupSchema } from '@schemas';

import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

import { authUserSchema } from './getMeQuery';

type RequestData = SignupSchema;
type Response = z.infer<typeof responseSchema>;

const responseSchema = z.object({ user: authUserSchema });

const keyGenerator: MutationKeyGenerator = () => ['auth', 'signup'];

client.registerEndpoint<RequestData, Response>(keyGenerator, {
  url: '/api/auth/signup',
  type: 'mutation',
  requestDataSchema: signupSchema,
  responseSchema,
  skipUnauthorizedHandling: true,
});

export { keyGenerator as signupKeyGenerator };
export type { RequestData as SignupRequestData, Response as SignupResponse };
