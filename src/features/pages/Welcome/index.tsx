'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { updateOnboardingKeyGenerator } from '@api/updateOnboardingMutation';
import type { UpdateOnboardingRequestData, UpdateOnboardingResponse } from '@api/updateOnboardingMutation';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import { onboardingCopy } from '@features/onboarding/copy';
import { refreshSessionCookie } from '@features/onboarding/refresh-session-cookie';

import FullPageLoader from '@components/FullPageLoader';
import Select from '@components/Select';

import { useAuth } from '@hooks/use-auth';
import { useCurrencyPreferences } from '@hooks/use-currency-preferences';

import { CURRENCIES } from '@/constants/currencies';

const SECONDARY_DISABLED = 'none';
const CURRENCY_OPTIONS = CURRENCIES.map((c) => ({ value: c.code, label: `${c.code} (${c.label})` }));

const copy = onboardingCopy.welcome;

const Welcome = () => {
  // Customs
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const { prefs, isLoading, mutate: mutatePrefs, isMutating } = useCurrencyPreferences();

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
    { value: SECONDARY_DISABLED, label: 'Disabled' },
    ...CURRENCY_OPTIONS.filter((o) => o.value !== prefs.primaryCurrency),
  ];
  const busy = onboardingMutation.isPending;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-text-primary text-lg font-semibold sm:text-xl">{copy.title(user.name)}</h1>
        <p className="text-text-tertiary text-xs sm:text-sm">{copy.subtitle}</p>
      </div>

      {error && (
        <div className="border-danger bg-danger-light text-danger rounded-lg border p-2.5 text-xs sm:p-3 sm:text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div>
          <label className="text-text-secondary mb-1.5 block text-sm font-medium">{copy.primaryLabel}</label>
          <Select
            value={prefs.primaryCurrency}
            onChange={(value) => {
              const secondary = prefs.secondaryCurrency === value ? null : prefs.secondaryCurrency;
              mutatePrefs({ primaryCurrency: value, secondaryCurrency: secondary });
            }}
            options={CURRENCY_OPTIONS}
            disabled={isLoading || busy}
          />
          <p className="text-text-muted mt-1.5 text-xs">{copy.primaryHint}</p>
        </div>

        <div>
          <label className="text-text-secondary mb-1.5 block text-sm font-medium">{copy.secondaryLabel}</label>
          <Select
            value={prefs.secondaryCurrency ?? SECONDARY_DISABLED}
            onChange={(value) => mutatePrefs({ secondaryCurrency: value === SECONDARY_DISABLED ? null : value })}
            options={secondaryOptions}
            disabled={isLoading || busy}
          />
          <p className="text-text-muted mt-1.5 text-xs">{copy.secondaryHint}</p>
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
            <span>{copy.ctaBusy}</span>
          </>
        ) : (
          copy.cta
        )}
      </button>

      <p className="text-text-muted text-center text-xs">{copy.footnote}</p>
    </div>
  );
};

export default Welcome;
