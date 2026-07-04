'use client';

import type { FC } from 'react';

import Select from '@components/Select';

import { CURRENCIES } from '@/constants/currencies';

interface CurrencySelectProps {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  className?: string;
  /** Borderless control for embedding inside MoneyInput. */
  bare?: boolean;
}

// Compact value (just the code) in the control; full "CODE (Name)" in the menu.
const OPTIONS = CURRENCIES.map((c) => ({ value: c.code, label: `${c.code} (${c.label})` }));

/** Currency picker over the supported set, using the app's custom Select. */
const CurrencySelect: FC<CurrencySelectProps> = ({ value, onChange, disabled, className = '', bare }) => (
  <Select
    value={value}
    onChange={onChange}
    options={OPTIONS}
    disabled={disabled}
    bare={bare}
    menuAlign="right"
    className={className}
    formatOptionLabel={(option, { context }) => (context === 'value' ? option.value : option.label)}
  />
);

export default CurrencySelect;
