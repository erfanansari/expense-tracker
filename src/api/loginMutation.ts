import { z } from 'zod';

import { loginSchema } from '@schemas';
import type { LoginSchema } from '@schemas';

import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

import { authUserSchema } from './getMeQuery';

type RequestData = LoginSchema;
type Response = z.infer<typeof responseSchema>;

const responseSchema = z.object({ user: authUserSchema });

const keyGenerator: MutationKeyGenerator = () => ['auth', 'login'];

client.registerEndpoint<RequestData, Response>(keyGenerator, {
  url: '/api/auth/login',
  type: 'mutation',
  requestDataSchema: loginSchema,
  responseSchema,
  // A 401 here means wrong credentials — surface it to the form, don't sign out.
  skipUnauthorizedHandling: true,
});

export { keyGenerator as loginKeyGenerator };
export type { RequestData as LoginRequestData, Response as LoginResponse };
