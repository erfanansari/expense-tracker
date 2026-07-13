import { z } from 'zod';

import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

const requestDataSchema = z
  .object({
    completeOnboarding: z.boolean().optional(),
    dismissChecklist: z.boolean().optional(),
  })
  .refine((data) => data.completeOnboarding || data.dismissChecklist, { message: 'Nothing to update' });

const responseSchema = z.object({
  onboardedAt: z.string().nullable(),
  checklistDismissedAt: z.string().nullable(),
});

type RequestData = z.infer<typeof requestDataSchema>;
type Response = z.infer<typeof responseSchema>;

const keyGenerator: MutationKeyGenerator = () => ['user', 'onboarding-update'];

client.registerEndpoint<RequestData, Response>(keyGenerator, {
  url: '/api/user/onboarding',
  method: 'PATCH',
  type: 'mutation',
  requestDataSchema,
  responseSchema,
});

export { keyGenerator as updateOnboardingKeyGenerator };
export type { RequestData as UpdateOnboardingRequestData, Response as UpdateOnboardingResponse };
