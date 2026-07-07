import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

import { notificationPreferencesSchema } from './getNotificationPreferencesQuery';
import type { NotificationPreferencesPayload } from './getNotificationPreferencesQuery';

type RequestData = Partial<NotificationPreferencesPayload>;
type Response = NotificationPreferencesPayload;

const keyGenerator: MutationKeyGenerator = () => ['settings', 'notifications-update'];

client.registerEndpoint<RequestData, Response>(keyGenerator, {
  url: '/api/settings/notifications',
  method: 'PUT',
  type: 'mutation',
  responseSchema: notificationPreferencesSchema,
});

export { keyGenerator as updateNotificationPreferencesKeyGenerator };
export type { RequestData as UpdateNotificationPreferencesRequestData };
