import { z } from 'zod';

import client from '@core/client';
import type { QueryKeyGenerator } from '@core/client/@types';

import { LOCALES } from '@/i18n/config';

export const localePreferencesSchema = z.object({
  locale: z.enum(LOCALES),
  calendar: z.enum(['auto', 'gregorian', 'jalali']),
  secondaryDateCaptions: z.boolean(),
});

export type LocalePreferencesPayload = z.infer<typeof localePreferencesSchema>;

type Response = LocalePreferencesPayload;

const keyGenerator: QueryKeyGenerator = () => ['settings', 'localization'];

client.registerEndpoint<void, Response>(keyGenerator, {
  url: '/api/settings/localization',
  method: 'GET',
  responseSchema: localePreferencesSchema,
  staleTime: 5 * 60 * 1000,
});

export { keyGenerator as getLocalePreferencesKeyGenerator };
export type { Response as LocalePreferencesResponse };
