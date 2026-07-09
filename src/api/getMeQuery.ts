import { z } from 'zod';

import type { AuthUser } from '@types';

import { DEMO_EMAIL } from '@constants';

import client from '@core/client';
import type { QueryKeyGenerator } from '@core/client/@types';

export const AUTH_SCOPE = ['auth'] as const;

export const authUserSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string().nullable(),
  isDemo: z.boolean(),
});

/**
 * Maps a Better Auth user object (id typed as string, no isDemo) to the
 * client-side AuthUser shape.
 */
export function toAuthUser(raw: unknown): AuthUser | null {
  if (!raw || typeof raw !== 'object' || !('id' in raw) || !('email' in raw)) return null;
  const user = raw as { id: string | number; email: string; name?: string | null };
  return {
    id: Number(user.id),
    email: user.email,
    name: user.name ?? null,
    isDemo: user.email === DEMO_EMAIL,
  };
}

type Response = AuthUser | null;

const responseSchema = authUserSchema.nullable();

const keyGenerator: QueryKeyGenerator = () => ['auth', 'me'];

client.registerEndpoint<void, Response>(keyGenerator, {
  url: '/api/auth/get-session',
  method: 'GET',
  // Better Auth returns { session, user } when signed in, or a null body when
  // not — unwrap so consumers see AuthUser | null directly.
  responseNormalizer: (response) => {
    const raw = response as unknown;
    if (raw && typeof raw === 'object' && 'user' in raw) {
      return toAuthUser((raw as { user: unknown }).user);
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
