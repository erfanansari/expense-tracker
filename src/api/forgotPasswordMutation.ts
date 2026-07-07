import { z } from 'zod';

import { forgotPasswordSchema } from '@schemas';
import type { ForgotPasswordSchema } from '@schemas';

import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

type RequestData = ForgotPasswordSchema;
type Response = z.infer<typeof responseSchema>;

const responseSchema = z.object({ message: z.string() });

const keyGenerator: MutationKeyGenerator = () => ['auth', 'forgot-password'];

client.registerEndpoint<RequestData, Response>(keyGenerator, {
  url: '/api/auth/forgot-password',
  type: 'mutation',
  requestDataSchema: forgotPasswordSchema,
  responseSchema,
  skipUnauthorizedHandling: true,
});

export { keyGenerator as forgotPasswordKeyGenerator };
export type { RequestData as ForgotPasswordRequestData, Response as ForgotPasswordResponse };
