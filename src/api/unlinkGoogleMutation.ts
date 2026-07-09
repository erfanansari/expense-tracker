import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

const keyGenerator: MutationKeyGenerator = () => ['auth', 'unlink-google'];

client.registerEndpoint<void, void>(keyGenerator, {
  url: '/api/auth/unlink-account',
  type: 'mutation',
  requestNormalizer: () => ({ providerId: 'google' }),
});

export { keyGenerator as unlinkGoogleKeyGenerator };
