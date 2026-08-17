'use client';

import { useMemo } from 'react';

import { useLocale, useTranslations } from 'next-intl';

import { Coins } from 'lucide-react';

import SectionCard from '@components/SectionCard';
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
    <SectionCard icon={Coins} title={t('title')} subtitle={t('subtitle')}>
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
    </SectionCard>
  );
};

export default CurrencySection;
