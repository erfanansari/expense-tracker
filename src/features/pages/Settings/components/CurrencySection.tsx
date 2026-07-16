'use client';

import { useMemo } from 'react';

import { useLocale, useTranslations } from 'next-intl';

import { Coins } from 'lucide-react';

import Select from '@components/Select';

import { useCurrencyPreferences } from '@hooks/use-currency-preferences';
import type { NumberFormat } from '@hooks/use-currency-preferences';

import { getLocalizedCurrencyOptions } from '@/constants/currencies';

const SECONDARY_DISABLED = 'none';

const CurrencySection = () => {
  const t = useTranslations('settings.currency');
  const locale = useLocale() as 'en' | 'fa';
  const CURRENCY_OPTIONS = useMemo(() => getLocalizedCurrencyOptions(locale), [locale]);
  const { prefs, isLoading, mutate, isMutating } = useCurrencyPreferences();

  const NUMBER_FORMAT_OPTIONS = [
    { value: 'auto', label: t('auto') },
    { value: 'compact', label: t('compact') },
    { value: 'full', label: t('full') },
  ];

  // Secondary options exclude the current primary (no point showing it twice)
  // and add a "Disabled" choice.
  const secondaryOptions = [
    { value: SECONDARY_DISABLED, label: t('disabled') },
    ...CURRENCY_OPTIONS.filter((o) => o.value !== prefs.primaryCurrency),
  ];

  const handlePrimaryChange = (value: string) => {
    // If the new primary equals the secondary, drop the secondary.
    const secondary = prefs.secondaryCurrency === value ? null : prefs.secondaryCurrency;
    mutate({ primaryCurrency: value, secondaryCurrency: secondary });
  };

  const handleSecondaryChange = (value: string) => {
    mutate({ secondaryCurrency: value === SECONDARY_DISABLED ? null : value });
  };

  const handleNumberFormatChange = (value: string) => {
    mutate({ numberFormat: value as NumberFormat });
  };

  return (
    <div className="border-border-subtle bg-background rounded-xl border shadow-sm">
      <div className="border-border-subtle border-b p-6">
        <div className="flex items-center gap-3">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2">
            <Coins className="text-text-secondary h-5 w-5" />
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
            <label className="text-text-secondary mb-1.5 block text-sm font-medium">{t('primaryLabel')}</label>
            <Select
              value={prefs.primaryCurrency}
              onChange={handlePrimaryChange}
              options={CURRENCY_OPTIONS}
              disabled={isLoading || isMutating}
            />
            <p className="text-text-muted mt-1.5 text-xs">{t('primaryHint')}</p>
          </div>

          <div>
            <label className="text-text-secondary mb-1.5 block text-sm font-medium">{t('secondaryLabel')}</label>
            <Select
              value={prefs.secondaryCurrency ?? SECONDARY_DISABLED}
              onChange={handleSecondaryChange}
              options={secondaryOptions}
              disabled={isLoading || isMutating}
            />
            <p className="text-text-muted mt-1.5 text-xs">{t('secondaryHint')}</p>
          </div>

          <div>
            <label className="text-text-secondary mb-1.5 block text-sm font-medium">{t('numberFormat')}</label>
            <Select
              value={prefs.numberFormat}
              onChange={handleNumberFormatChange}
              options={NUMBER_FORMAT_OPTIONS}
              disabled={isLoading || isMutating}
            />
            <p className="text-text-muted mt-1.5 text-xs">{t('numberFormatHint')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencySection;
