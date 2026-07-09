import { z } from 'zod';

import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

type RequestData = void;
type Response = z.infer<typeof responseSchema>;

// Better Auth responds with the Google consent URL; the caller redirects to it
// and lands back on /settings after linking.
const responseSchema = z.object({ url: z.string() });

const keyGenerator: MutationKeyGenerator = () => ['auth', 'link-google'];

client.registerEndpoint<RequestData, Response>(keyGenerator, {
  url: '/api/auth/link-social',
  type: 'mutation',
  requestNormalizer: () => ({ provider: 'google', callbackURL: '/settings' }),
  responseSchema,
});

export { keyGenerator as linkGoogleKeyGenerator };
export type { Response as LinkGoogleResponse };
