'use client';

import { useMemo } from 'react';
import type { FC } from 'react';

import { useLocale } from 'next-intl';

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
  // Compact value (just the code) in the control; full "CODE (Name)" in the menu.
  const options = useMemo(() => getLocalizedCurrencyOptions(locale), [locale]);

  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      disabled={disabled}
      bare={bare}
      menuAlign="right"
      className={className}
      formatOptionLabel={(option, { context }) => (context === 'value' ? option.value : option.label)}
    />
  );
};

export default CurrencySelect;
