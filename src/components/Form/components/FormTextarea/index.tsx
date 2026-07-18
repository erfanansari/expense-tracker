'use client';

import { useController, useFormContext } from 'react-hook-form';

import type { FormFieldBaseProps } from '../../@types';

interface FormTextareaProps extends FormFieldBaseProps {
  rows?: number;
}

const FormTextarea = ({ name, label, placeholder, disabled, rows = 5, className }: FormTextareaProps) => {
  const { control } = useFormContext();
  const { field, fieldState } = useController({ name, control });

  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="text-text-primary mb-1.5 block text-xs font-medium sm:mb-2 sm:text-sm">
          {label}
        </label>
      )}
      <textarea
        {...field}
        id={name}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={fieldState.invalid || undefined}
        className={`border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-primary w-full resize-y rounded-lg border px-3 py-2.5 text-sm focus:outline-none sm:px-4 sm:py-3 sm:text-base ${
          fieldState.error ? 'border-danger' : ''
        }`}
      />
      {fieldState.error?.message && <p className="text-danger mt-1 text-xs">{fieldState.error.message}</p>}
    </div>
  );
};

export default FormTextarea;
