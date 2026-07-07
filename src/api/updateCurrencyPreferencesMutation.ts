import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

import type { CurrencyPreferencesPayload } from '@stores/currency';

import { currencyPreferencesSchema } from './getCurrencyPreferencesQuery';

type RequestData = Partial<CurrencyPreferencesPayload>;
type Response = CurrencyPreferencesPayload;

const keyGenerator: MutationKeyGenerator = () => ['settings', 'currency-update'];

client.registerEndpoint<RequestData, Response>(keyGenerator, {
  url: '/api/settings/currency',
  method: 'PUT',
  type: 'mutation',
  responseSchema: currencyPreferencesSchema,
});

export { keyGenerator as updateCurrencyPreferencesKeyGenerator };
export type { RequestData as UpdateCurrencyPreferencesRequestData };
