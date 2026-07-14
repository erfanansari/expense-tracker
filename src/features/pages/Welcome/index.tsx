'use client';

import { useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { updateOnboardingKeyGenerator } from '@api/updateOnboardingMutation';
import type { UpdateOnboardingRequestData, UpdateOnboardingResponse } from '@api/updateOnboardingMutation';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import { refreshSessionCookie } from '@features/onboarding/refresh-session-cookie';

import FullPageLoader from '@components/FullPageLoader';
import Select from '@components/Select';

import { useAuth } from '@hooks/use-auth';
import { useCurrencyPreferences } from '@hooks/use-currency-preferences';
import { useLocalePreferences } from '@hooks/use-locale-preferences';

import { CURRENCIES } from '@/constants/currencies';
import type { AppLocale } from '@/i18n/config';

const SECONDARY_DISABLED = 'none';
const CURRENCY_OPTIONS = CURRENCIES.map((c) => ({ value: c.code, label: `${c.code} (${c.label})` }));
// Each language is shown in its own tongue, so the options never translate.
const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'fa', label: 'فارسی' },
];

const Welcome = () => {
  // Customs
  const t = useTranslations('onboarding.welcome');
  const tCurrency = useTranslations('settings.currency');
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const { prefs, isLoading, mutate: mutatePrefs, isMutating } = useCurrencyPreferences();
  const { prefs: localePrefs, mutate: mutateLocale, isMutating: isMutatingLocale } = useLocalePreferences();

  // States
  const [error, setError] = useState('');

  // Mutations
  const onboardingMutation = useMutation<UpdateOnboardingResponse, Error, UpdateOnboardingRequestData>({
    mutationKey: updateOnboardingKeyGenerator(),
    onSuccess: async ({ onboardedAt }) => {
      updateUser({ onboardedAt });
      // Reissue the session cookie so hard reloads see the flag immediately
      await refreshSessionCookie();
      router.replace('/overview');
    },
    onError: (err) => setError(err.message || 'Something went wrong'),
  });

  // Already onboarded (or demo) — this page has nothing to offer
  const shouldRedirect = Boolean(user && (user.onboardedAt || user.isDemo));
  useEffect(() => {
    if (shouldRedirect) router.replace('/overview');
  }, [shouldRedirect, router]);
  if (!user || shouldRedirect) return <FullPageLoader />;

  // Variables
  const secondaryOptions = [
    { value: SECONDARY_DISABLED, label: tCurrency('disabled') },
    ...CURRENCY_OPTIONS.filter((o) => o.value !== prefs.primaryCurrency),
  ];
  const busy = onboardingMutation.isPending;

  const handleLanguageChange = (value: string) => {
    if (value === localePrefs.locale) return;
    mutateLocale({ locale: value as AppLocale }, { onSuccess: () => router.refresh() });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-text-primary text-lg font-semibold sm:text-xl">
          {user.name ? t('titleNamed', { name: user.name.split(' ')[0] }) : t('titleAnonymous')}
        </h1>
        <p className="text-text-tertiary text-xs sm:text-sm">{t('subtitle')}</p>
      </div>

      {error && (
        <div className="border-danger bg-danger-light text-danger rounded-lg border p-2.5 text-xs sm:p-3 sm:text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div>
          <label className="text-text-secondary mb-1.5 block text-sm font-medium">{t('languageLabel')}</label>
          <Select
            value={localePrefs.locale}
            onChange={handleLanguageChange}
            options={LANGUAGE_OPTIONS}
            disabled={isMutatingLocale}
          />
          <p className="text-text-muted mt-1.5 text-xs">{t('languageHint')}</p>
        </div>

        <div>
          <label className="text-text-secondary mb-1.5 block text-sm font-medium">{t('primaryLabel')}</label>
          <Select
            value={prefs.primaryCurrency}
            onChange={(value) => {
              const secondary = prefs.secondaryCurrency === value ? null : prefs.secondaryCurrency;
              mutatePrefs({ primaryCurrency: value, secondaryCurrency: secondary });
            }}
            options={CURRENCY_OPTIONS}
            disabled={isLoading || busy}
          />
          <p className="text-text-muted mt-1.5 text-xs">{t('primaryHint')}</p>
        </div>

        <div>
          <label className="text-text-secondary mb-1.5 block text-sm font-medium">{t('secondaryLabel')}</label>
          <Select
            value={prefs.secondaryCurrency ?? SECONDARY_DISABLED}
            onChange={(value) => mutatePrefs({ secondaryCurrency: value === SECONDARY_DISABLED ? null : value })}
            options={secondaryOptions}
            disabled={isLoading || busy}
          />
          <p className="text-text-muted mt-1.5 text-xs">{t('secondaryHint')}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          setError('');
          onboardingMutation.mutate({ completeOnboarding: true });
        }}
        disabled={busy || isMutating}
        className="bg-primary hover:bg-button-primary-bg-hover text-primary-foreground flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-3 sm:text-base"
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
            <span>{t('ctaBusy')}</span>
          </>
        ) : (
          t('cta')
        )}
      </button>

      <p className="text-text-muted text-center text-xs">{t('footnote')}</p>
    </div>
  );
};

export default Welcome;
