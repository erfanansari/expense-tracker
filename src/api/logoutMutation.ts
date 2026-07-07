import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

const keyGenerator: MutationKeyGenerator = () => ['auth', 'logout'];

client.registerEndpoint<void, void>(keyGenerator, {
  url: '/api/auth/logout',
  type: 'mutation',
  skipUnauthorizedHandling: true,
});

export { keyGenerator as logoutKeyGenerator };
