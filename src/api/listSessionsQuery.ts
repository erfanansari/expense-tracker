import { z } from 'zod';

import client from '@core/client';
import type { QueryKeyGenerator } from '@core/client/@types';

const sessionSchema = z.object({
  token: z.string(),
  userAgent: z.string().nullable(),
  ipAddress: z.string().nullable(),
  createdAt: z.string(),
  expiresAt: z.string(),
});

const responseSchema = z.array(sessionSchema);

export type ActiveSession = z.infer<typeof sessionSchema>;
type Response = z.infer<typeof responseSchema>;

const keyGenerator: QueryKeyGenerator = () => ['auth', 'sessions'];

client.registerEndpoint<void, Response>(keyGenerator, {
  url: '/api/auth/list-sessions',
  method: 'GET',
  responseNormalizer: (response) => {
    const raw = response as unknown;
    if (!Array.isArray(raw)) return [];
    return raw.map(
      (s: {
        token: string;
        userAgent?: string | null;
        ipAddress?: string | null;
        createdAt: string | Date;
        expiresAt: string | Date;
      }) => ({
        token: s.token,
        userAgent: s.userAgent ?? null,
        ipAddress: s.ipAddress ?? null,
        createdAt: String(s.createdAt),
        expiresAt: String(s.expiresAt),
      })
    );
  },
  responseSchema,
});

export { keyGenerator as listSessionsKeyGenerator };
export type { Response as ListSessionsResponse };
