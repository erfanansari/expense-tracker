'use client';

import { useMemo } from 'react';
import type { FC } from 'react';

import { useLocale, useTranslations } from 'next-intl';

import Select from '@components/Select';

import { getLocalizedCurrencyOptions } from '@/constants/currencies';

interface CurrencySelectProps {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  className?: string;
  /** Borderless control for embedding inside MoneyInput. */
  bare?: boolean;
}

/** Currency picker over the supported set, using the app's custom Select. */
const CurrencySelect: FC<CurrencySelectProps> = ({ value, onChange, disabled, className = '', bare }) => {
  const locale = useLocale() as 'en' | 'fa';
  const t = useTranslations('common');
  // Compact value (just the code) in the control; full "CODE (Name)" in the menu.
  const options = useMemo(() => getLocalizedCurrencyOptions(locale), [locale]);

  // MoneyInput places the amount field first in the DOM and CurrencySelect
  // second, with no rtl:flex-row-reverse — so under RTL the control sits at
  // the visual LEFT, not the right. menuAlign must flip with it, or the
  // portalled menu anchors to the wrong viewport edge entirely.
  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      disabled={disabled}
      bare={bare}
      ariaLabel={t('currencyLabel')}
      menuAlign={locale === 'fa' ? 'left' : 'right'}
      className={className}
      formatOptionLabel={(option, { context }) => (context === 'value' ? option.value : option.label)}
    />
  );
};

export default CurrencySelect;
