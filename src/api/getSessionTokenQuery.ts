import { z } from 'zod';

import client from '@core/client';
import type { QueryKeyGenerator } from '@core/client/@types';

type Response = string | null;

const responseSchema = z.string().nullable();

// Current session token — used to mark "this device" in the sessions list.
const keyGenerator: QueryKeyGenerator = () => ['auth', 'session-token'];

client.registerEndpoint<void, Response>(keyGenerator, {
  url: '/api/auth/get-session',
  method: 'GET',
  responseNormalizer: (response) => {
    const raw = response as unknown;
    if (raw && typeof raw === 'object' && 'session' in raw) {
      return (raw as { session: { token?: string } }).session?.token ?? null;
    }
    return null;
  },
  responseSchema,
  skipUnauthorizedHandling: true,
});

export { keyGenerator as getSessionTokenKeyGenerator };
export type { Response as GetSessionTokenResponse };
