import { z } from 'zod';

import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

type RequestData = { email: string };
type Response = z.infer<typeof responseSchema>;

const responseSchema = z.object({ status: z.boolean() });

const keyGenerator: MutationKeyGenerator = () => ['auth', 'resend-verification'];

client.registerEndpoint<RequestData, Response>(keyGenerator, {
  url: '/api/auth/send-verification-email',
  type: 'mutation',
  requestDataSchema: z.object({ email: z.string().email() }),
  requestNormalizer: (data) => ({ ...data, callbackURL: '/overview' }),
  responseSchema,
  skipUnauthorizedHandling: true,
});

export { keyGenerator as resendVerificationKeyGenerator };
export type { RequestData as ResendVerificationRequestData, Response as ResendVerificationResponse };
