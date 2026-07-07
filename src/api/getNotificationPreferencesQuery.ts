import { z } from 'zod';

import client from '@core/client';
import type { QueryKeyGenerator } from '@core/client/@types';

export const notificationPreferencesSchema = z.object({
  emailEnabled: z.boolean(),
  monthlyReportEnabled: z.boolean(),
  yearlyReportEnabled: z.boolean(),
});

type Response = z.infer<typeof notificationPreferencesSchema>;

const keyGenerator: QueryKeyGenerator = () => ['settings', 'notifications'];

client.registerEndpoint<void, Response>(keyGenerator, {
  url: '/api/settings/notifications',
  method: 'GET',
  responseSchema: notificationPreferencesSchema,
});

export { keyGenerator as getNotificationPreferencesKeyGenerator };
export type { Response as NotificationPreferencesPayload };
