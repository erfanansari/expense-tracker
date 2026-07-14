import { createChangePasswordSchema, fallbackT } from '@schemas';
import type { ChangePasswordSchema } from '@schemas';

import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

type RequestData = ChangePasswordSchema;

const keyGenerator: MutationKeyGenerator = () => ['auth', 'change-password'];

client.registerEndpoint<RequestData, void>(keyGenerator, {
  url: '/api/auth/change-password',
  type: 'mutation',
  requestDataSchema: createChangePasswordSchema(fallbackT),
  // Changing the password signs every other device out
  requestNormalizer: (data) => ({
    currentPassword: data.currentPassword,
    newPassword: data.password,
    revokeOtherSessions: true,
  }),
  // A wrong current password must surface in the form, not trigger global signout
  skipUnauthorizedHandling: true,
});

export { keyGenerator as changePasswordKeyGenerator };
export type { RequestData as ChangePasswordRequestData };
