import { z } from 'zod';

import type { AuthUser } from '@types';

import client from '@core/client';
import type { QueryKeyGenerator } from '@core/client/@types';

export const AUTH_SCOPE = ['auth'] as const;

export const authUserSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string().nullable(),
  isDemo: z.boolean(),
});

type Response = AuthUser | null;

const responseSchema = authUserSchema.nullable();

const keyGenerator: QueryKeyGenerator = () => ['auth', 'me'];

client.registerEndpoint<void, Response>(keyGenerator, {
  url: '/api/auth/me',
  method: 'GET',
  // The route wraps the user as { user: AuthUser | null } and returns 200 even
  // when logged out — unwrap so consumers see AuthUser | null directly.
  responseNormalizer: (response) => {
    const raw = response as unknown;
    if (raw && typeof raw === 'object' && 'user' in raw) {
      return (raw as { user: AuthUser | null }).user ?? null;
    }
    return null;
  },
  responseSchema,
  skipUnauthorizedHandling: true,
  staleTime: 5 * 60 * 1000,
  refetchOnWindowFocus: true,
});

export { keyGenerator as getMeKeyGenerator };
export type { Response as GetMeResponse };
