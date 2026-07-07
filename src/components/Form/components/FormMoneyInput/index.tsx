'use client';

import { useController, useFormContext } from 'react-hook-form';

import MoneyInput from '@components/MoneyInput';

interface FormMoneyInputProps {
  /** Field holding the numeric amount. */
  amountName: string;
  /** Field holding the currency code. */
  currencyName: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  /** Override the default field write — for forms where the amount drives derived fields. */
  onAmountChange?: (value: number) => void;
}

/** MoneyInput binds two form fields at once (amount + currency). */
const FormMoneyInput = ({
  amountName,
  currencyName,
  placeholder,
  disabled,
  readOnly,
  className,
  onAmountChange,
}: FormMoneyInputProps) => {
  const { control } = useFormContext();
  const { field: amountField, fieldState: amountState } = useController({ name: amountName, control });
  const { field: currencyField } = useController({ name: currencyName, control });

  return (
    <div className={className}>
      <MoneyInput
        amount={amountField.value ?? 0}
        currency={currencyField.value ?? ''}
        onAmountChange={onAmountChange ?? amountField.onChange}
        onCurrencyChange={currencyField.onChange}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
      />
      {amountState.error?.message && <p className="text-danger mt-1 text-xs">{amountState.error.message}</p>}
    </div>
  );
};

export default FormMoneyInput;
