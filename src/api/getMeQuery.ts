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
  onboardedAt: z.string().nullable(),
  checklistDismissedAt: z.string().nullable(),
});

/** Better Auth may hydrate date-ish fields as Date objects — normalize to ISO. */
function toIsoOrNull(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  return null;
}

/**
 * Maps a Better Auth user object (id typed as string, no isDemo) to the
 * client-side AuthUser shape.
 */
export function toAuthUser(raw: unknown): AuthUser | null {
  if (!raw || typeof raw !== 'object' || !('id' in raw) || !('email' in raw)) return null;
  const user = raw as {
    id: string | number;
    email: string;
    name?: string | null;
    onboardedAt?: unknown;
    checklistDismissedAt?: unknown;
  };
  return {
    id: Number(user.id),
    email: user.email,
    name: user.name ?? null,
    isDemo: user.email === DEMO_EMAIL,
    onboardedAt: toIsoOrNull(user.onboardedAt),
    checklistDismissedAt: toIsoOrNull(user.checklistDismissedAt),
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
