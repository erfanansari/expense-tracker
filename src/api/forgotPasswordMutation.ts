import { z } from 'zod';

import { createForgotPasswordSchema, fallbackT } from '@schemas';
import type { ForgotPasswordSchema } from '@schemas';

import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

type RequestData = ForgotPasswordSchema;
type Response = z.infer<typeof responseSchema>;

const responseSchema = z.object({ status: z.boolean() });

const keyGenerator: MutationKeyGenerator = () => ['auth', 'forgot-password'];

client.registerEndpoint<RequestData, Response>(keyGenerator, {
  url: '/api/auth/request-password-reset',
  type: 'mutation',
  requestDataSchema: createForgotPasswordSchema(fallbackT),
  // redirectTo lands the emailed link on our existing /reset-password?token= page
  requestNormalizer: (data) => ({ ...data, redirectTo: '/reset-password' }),
  responseSchema,
  skipUnauthorizedHandling: true,
});

export { keyGenerator as forgotPasswordKeyGenerator };
export type { RequestData as ForgotPasswordRequestData, Response as ForgotPasswordResponse };
