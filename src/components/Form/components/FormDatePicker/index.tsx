'use client';

import { useController, useFormContext } from 'react-hook-form';

import DatePicker from '@components/DatePicker';

import type { FormFieldBaseProps } from '../../@types';

interface FormDatePickerProps extends Omit<FormFieldBaseProps, 'disabled'> {
  isClearable?: boolean;
}

const FormDatePicker = ({ name, placeholder, isClearable, className }: FormDatePickerProps) => {
  const { control } = useFormContext();
  const { field, fieldState } = useController({ name, control });

  return (
    <div className={className}>
      <DatePicker
        value={field.value ?? ''}
        onChange={field.onChange}
        placeholder={placeholder}
        isClearable={isClearable}
      />
      {fieldState.error?.message && <p className="text-danger mt-1 text-xs">{fieldState.error.message}</p>}
    </div>
  );
};

export default FormDatePicker;
