import { resetPasswordSchema } from '@schemas';
import type { ResetPasswordSchema } from '@schemas';

import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

type RequestData = ResetPasswordSchema;

const keyGenerator: MutationKeyGenerator = () => ['auth', 'reset-password'];

client.registerEndpoint<RequestData, void>(keyGenerator, {
  url: '/api/auth/reset-password',
  type: 'mutation',
  requestDataSchema: resetPasswordSchema,
  // Better Auth expects { newPassword, token }
  requestNormalizer: (data) => ({ token: data.token, newPassword: data.password }),
  skipUnauthorizedHandling: true,
});

export { keyGenerator as resetPasswordKeyGenerator };
export type { RequestData as ResetPasswordRequestData };
