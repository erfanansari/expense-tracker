import { z } from 'zod';

import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

type RequestData = void;
type Response = z.infer<typeof responseSchema>;

// Better Auth responds with the Google consent URL; the caller redirects to it.
const responseSchema = z.object({ url: z.string() });

const keyGenerator: MutationKeyGenerator = () => ['auth', 'google-sign-in'];

client.registerEndpoint<RequestData, Response>(keyGenerator, {
  url: '/api/auth/sign-in/social',
  type: 'mutation',
  requestNormalizer: () => ({ provider: 'google', callbackURL: '/overview' }),
  responseSchema,
  skipUnauthorizedHandling: true,
});

export { keyGenerator as googleSignInKeyGenerator };
export type { Response as GoogleSignInResponse };
