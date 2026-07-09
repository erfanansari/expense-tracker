import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

const keyGenerator: MutationKeyGenerator = () => ['auth', 'logout'];

client.registerEndpoint<void, void>(keyGenerator, {
  url: '/api/auth/sign-out',
  type: 'mutation',
  // Better Auth rejects bodyless posts with 415 — always send an empty JSON body
  requestNormalizer: () => ({}),
  skipUnauthorizedHandling: true,
});

export { keyGenerator as logoutKeyGenerator };
