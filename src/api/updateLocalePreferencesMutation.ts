import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

import { localePreferencesSchema } from './getLocalePreferencesQuery';
import type { LocalePreferencesPayload } from './getLocalePreferencesQuery';

type RequestData = Partial<LocalePreferencesPayload>;
type Response = LocalePreferencesPayload;

const keyGenerator: MutationKeyGenerator = () => ['settings', 'localization-update'];

client.registerEndpoint<RequestData, Response>(keyGenerator, {
  url: '/api/settings/localization',
  method: 'PUT',
  type: 'mutation',
  responseSchema: localePreferencesSchema,
});

export { keyGenerator as updateLocalePreferencesKeyGenerator };
export type { RequestData as UpdateLocalePreferencesRequestData };
