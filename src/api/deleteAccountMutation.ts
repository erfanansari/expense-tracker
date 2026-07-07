import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

const keyGenerator: MutationKeyGenerator = () => ['user', 'delete-account'];

client.registerEndpoint<void, void>(keyGenerator, {
  url: '/api/user/account',
  method: 'DELETE',
  type: 'mutation',
  // Deleting the account invalidates the session — the caller owns the redirect.
  skipUnauthorizedHandling: true,
});

export { keyGenerator as deleteAccountKeyGenerator };
