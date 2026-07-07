'use client';

import { useController, useFormContext } from 'react-hook-form';

import Select from '@components/Select';
import type { SelectOption } from '@components/Select';

import type { FormFieldBaseProps } from '../../@types';

interface FormSelectProps extends FormFieldBaseProps {
  options: SelectOption[];
  /** Parse the selected option value into a number before storing it in the form. */
  valueAsNumber?: boolean;
}

const FormSelect = ({ name, options, valueAsNumber, placeholder, disabled, className }: FormSelectProps) => {
  const { control } = useFormContext();
  const { field, fieldState } = useController({ name, control });

  return (
    <div className={className}>
      <Select
        value={field.value === undefined || field.value === null ? '' : String(field.value)}
        onChange={(value) => field.onChange(valueAsNumber ? parseInt(value, 10) : value)}
        options={options}
        placeholder={placeholder}
        disabled={disabled}
      />
      {fieldState.error?.message && <p className="text-danger mt-1 text-xs">{fieldState.error.message}</p>}
    </div>
  );
};

export default FormSelect;
