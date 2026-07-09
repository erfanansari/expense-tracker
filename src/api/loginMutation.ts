import { z } from 'zod';

import { loginSchema } from '@schemas';
import type { LoginSchema } from '@schemas';

import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

import { authUserSchema, toAuthUser } from './getMeQuery';

type RequestData = LoginSchema;
type Response = z.infer<typeof responseSchema>;

const responseSchema = z.object({ user: authUserSchema });

const keyGenerator: MutationKeyGenerator = () => ['auth', 'login'];

client.registerEndpoint<RequestData, Response>(keyGenerator, {
  url: '/api/auth/sign-in/email',
  type: 'mutation',
  requestDataSchema: loginSchema,
  // Better Auth returns { redirect, token, user } — reshape to { user: AuthUser }
  responseNormalizer: (response) => {
    const raw = response as unknown;
    const user = raw && typeof raw === 'object' && 'user' in raw ? toAuthUser((raw as { user: unknown }).user) : null;
    return { user } as Response;
  },
  responseSchema,
  // A 401 here means wrong credentials — surface it to the form, don't sign out.
  skipUnauthorizedHandling: true,
});

export { keyGenerator as loginKeyGenerator };
export type { RequestData as LoginRequestData, Response as LoginResponse };
