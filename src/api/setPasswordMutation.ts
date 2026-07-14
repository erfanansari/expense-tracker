import { createSetPasswordSchema, fallbackT } from '@schemas';
import type { SetPasswordSchema } from '@schemas';

import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

type RequestData = SetPasswordSchema;

const keyGenerator: MutationKeyGenerator = () => ['auth', 'set-password'];

client.registerEndpoint<RequestData, void>(keyGenerator, {
  url: '/api/user/set-password',
  type: 'mutation',
  requestDataSchema: createSetPasswordSchema(fallbackT),
  requestNormalizer: (data) => ({ newPassword: data.password }),
});

export { keyGenerator as setPasswordKeyGenerator };
export type { RequestData as SetPasswordRequestData };
