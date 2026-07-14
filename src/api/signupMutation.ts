import { z } from 'zod';

import { createSignupSchema, fallbackT } from '@schemas';
import type { SignupSchema } from '@schemas';

import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

type RequestData = SignupSchema;
type Response = z.infer<typeof responseSchema>;

// With requireEmailVerification no session is created on signup — the client
// sends the user to the verify-email screen instead of the dashboard.
const responseSchema = z.object({ email: z.string() });

const keyGenerator: MutationKeyGenerator = () => ['auth', 'signup'];

client.registerEndpoint<RequestData, Response>(keyGenerator, {
  url: '/api/auth/sign-up/email',
  type: 'mutation',
  requestDataSchema: createSignupSchema(fallbackT),
  requestNormalizer: (data) => ({ name: data.name, email: data.email, password: data.password }),
  responseNormalizer: (response) => {
    const raw = response as unknown;
    const user =
      raw && typeof raw === 'object' && 'user' in raw ? ((raw as { user: { email?: string } }).user ?? null) : null;
    return { email: user?.email ?? '' } as Response;
  },
  responseSchema,
  skipUnauthorizedHandling: true,
});

export { keyGenerator as signupKeyGenerator };
export type { RequestData as SignupRequestData, Response as SignupResponse };
