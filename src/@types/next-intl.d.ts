import type { AppLocale } from '@/i18n/config';

import type en from '../../messages/en.json';

declare module 'next-intl' {
  interface AppConfig {
    Locale: AppLocale;
    Messages: typeof en;
  }
}
