'use client';

import type { ReactNode } from 'react';

import type { FieldValues, SubmitHandler, UseFormReturn } from 'react-hook-form';
import { FormProvider } from 'react-hook-form';

interface FormProps<T extends FieldValues> {
  methods: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
  children: ReactNode;
  className?: string;
}

/** RHF FormProvider + <form> wrapper — field components below it read the form context. */
const Form = <T extends FieldValues>({ methods, onSubmit, children, className }: FormProps<T>) => (
  <FormProvider {...methods}>
    <form onSubmit={methods.handleSubmit(onSubmit)} className={className} noValidate>
      {children}
    </form>
  </FormProvider>
);

export default Form;
