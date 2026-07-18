import { z } from 'zod';

import { createFeedbackSchema, fallbackT } from '@schemas';
import type { FeedbackSchema } from '@schemas';

import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

type RequestData = FeedbackSchema;
type Response = z.infer<typeof responseSchema>;

const responseSchema = z.object({ status: z.boolean() });

const keyGenerator: MutationKeyGenerator = () => ['feedback', 'send'];

client.registerEndpoint<RequestData, Response>(keyGenerator, {
  url: '/api/feedback',
  type: 'mutation',
  requestDataSchema: createFeedbackSchema(fallbackT),
  responseSchema,
});

export { keyGenerator as sendFeedbackKeyGenerator };
export type { RequestData as SendFeedbackRequestData, Response as SendFeedbackResponse };
