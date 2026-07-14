'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { Globe } from 'lucide-react';

import Select from '@components/Select';
import Toggle from '@components/Toggle';

import { useLocalePreferences } from '@hooks/use-locale-preferences';

import type { CalendarPreference } from '@utils';

import type { AppLocale } from '@/i18n/config';

// Each language is shown in its own tongue, so the options never translate.
const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'fa', label: 'فارسی' },
];

const LanguageSection = () => {
  const t = useTranslations('settings.language');
  const router = useRouter();
  const { prefs, isLoading, mutate, isMutating } = useLocalePreferences();

  const CALENDAR_OPTIONS = [
    { value: 'auto', label: t('calendarAuto') },
    { value: 'gregorian', label: t('calendarGregorian') },
    { value: 'jalali', label: t('calendarJalali') },
  ];

  const handleLanguageChange = (value: string) => {
    if (value === prefs.locale) return;
    mutate(
      { locale: value as AppLocale },
      // The PUT response sets the locale cookie; refresh re-renders the RSC
      // tree (html lang/dir + messages) without losing client state.
      { onSuccess: () => router.refresh() }
    );
  };

  const handleCalendarChange = (value: string) => {
    mutate({ calendar: value as CalendarPreference });
  };

  const handleCaptionsChange = (next: boolean) => {
    mutate({ secondaryDateCaptions: next });
  };

  return (
    <div className="border-border-subtle bg-background rounded-xl border shadow-sm">
      <div className="border-border-subtle border-b p-6">
        <div className="flex items-center gap-3">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2">
            <Globe className="text-text-secondary h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-text-primary text-lg font-semibold">{t('title')}</h2>
            <p className="text-text-muted text-sm">{t('subtitle')}</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <div>
            <label className="text-text-secondary mb-1.5 block text-sm font-medium">{t('languageLabel')}</label>
            <Select
              value={prefs.locale}
              onChange={handleLanguageChange}
              options={LANGUAGE_OPTIONS}
              disabled={isLoading || isMutating}
            />
            <p className="text-text-muted mt-1.5 text-xs">{t('languageDescription')}</p>
          </div>

          <div>
            <label className="text-text-secondary mb-1.5 block text-sm font-medium">{t('calendarLabel')}</label>
            <Select
              value={prefs.calendar}
              onChange={handleCalendarChange}
              options={CALENDAR_OPTIONS}
              disabled={isLoading || isMutating}
            />
            <p className="text-text-muted mt-1.5 text-xs">{t('calendarDescription')}</p>
          </div>
        </div>

        <div className="border-border-subtle mt-5 flex max-w-2xl items-center justify-between gap-4 border-t pt-5">
          <div>
            <p className="text-text-primary text-sm font-medium">{t('captionsLabel')}</p>
            <p className="text-text-muted mt-0.5 text-xs">{t('captionsDescription')}</p>
          </div>
          <Toggle
            checked={prefs.secondaryDateCaptions}
            onChange={handleCaptionsChange}
            disabled={isLoading || isMutating}
            label={t('captionsLabel')}
          />
        </div>
      </div>
    </div>
  );
};

export default LanguageSection;
