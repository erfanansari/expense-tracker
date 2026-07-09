import { z } from 'zod';

import client from '@core/client';
import type { QueryKeyGenerator } from '@core/client/@types';

const linkedAccountSchema = z.object({
  id: z.coerce.string(),
  providerId: z.string(),
});

const responseSchema = z.array(linkedAccountSchema);

export type LinkedAccount = z.infer<typeof linkedAccountSchema>;
type Response = z.infer<typeof responseSchema>;

const keyGenerator: QueryKeyGenerator = () => ['auth', 'accounts'];

client.registerEndpoint<void, Response>(keyGenerator, {
  url: '/api/auth/list-accounts',
  method: 'GET',
  // Keep only the fields the UI needs; Better Auth returns tokens/scopes too
  responseNormalizer: (response) => {
    const raw = response as unknown;
    if (!Array.isArray(raw)) return [];
    return raw.map((a: { id: string | number; providerId: string }) => ({
      id: String(a.id),
      providerId: a.providerId,
    }));
  },
  responseSchema,
});

export { keyGenerator as listAccountsKeyGenerator };
export type { Response as ListAccountsResponse };
