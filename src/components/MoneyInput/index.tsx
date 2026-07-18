'use client';

import type { FC } from 'react';

import AmountInput from '@components/AmountInput';
import CurrencySelect from '@components/CurrencySelect';

interface MoneyInputProps {
  amount: number;
  currency: string;
  onAmountChange: (value: number) => void;
  onCurrencyChange: (code: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  /** Render the amount field read-only (e.g. a computed total). */
  readOnly?: boolean;
  /** Id for the amount input so an external <label htmlFor> can target it. */
  amountId?: string;
}

/**
 * A single money field: amount on the left and a compact currency picker on the
 * right, unified inside one bordered group with a shared focus ring (Wise/Stripe
 * pattern). The container owns the border; the inner controls are borderless.
 */
const MoneyInput: FC<MoneyInputProps> = ({
  amount,
  currency,
  onAmountChange,
  onCurrencyChange,
  placeholder,
  required,
  disabled,
  readOnly,
  amountId,
}) => (
  <div className="border-border-subtle bg-background focus-within:border-blue focus-within:ring-blue/15 flex items-stretch overflow-hidden rounded-lg border transition-all duration-150 focus-within:ring-2">
    <AmountInput
      id={amountId}
      value={amount}
      onChange={onAmountChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
      className="text-text-primary placeholder:text-text-muted focus:bg-background-secondary/60 min-w-0 flex-1 rounded-s-lg border-0 bg-transparent px-3 py-2 text-sm focus:ring-0 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
    />
    <div className="bg-border-subtle my-1.5 w-px shrink-0" aria-hidden="true" />
    <CurrencySelect value={currency} onChange={onCurrencyChange} disabled={disabled} bare className="shrink-0" />
  </div>
);

export default MoneyInput;
