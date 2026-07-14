'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { forgotPasswordKeyGenerator } from '@api/forgotPasswordMutation';
import type { ForgotPasswordRequestData, ForgotPasswordResponse } from '@api/forgotPasswordMutation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { createForgotPasswordSchema } from '@schemas';

import Form from '@components/Form';
import FormInput from '@components/Form/components/FormInput';

const ForgotPassword = () => {
  // Customs
  const t = useTranslations('auth');
  const tZod = useTranslations();

  // States
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Forms
  const methods = useForm<ForgotPasswordRequestData>({
    resolver: zodResolver(createForgotPasswordSchema(tZod)),
    defaultValues: { email: '' },
    mode: 'all',
  });

  // Mutations
  const forgotPasswordMutation = useMutation<ForgotPasswordResponse, Error, ForgotPasswordRequestData>({
    mutationKey: forgotPasswordKeyGenerator(),
    onSuccess: () => {
      setMessage(t('forgot.success'));
      methods.reset();
    },
    onError: (err) => {
      setError(err.message || t('forgot.requestFailed'));
    },
  });

  // Variables
  const loading = forgotPasswordMutation.isPending;

  const handleSubmit = (data: ForgotPasswordRequestData) => {
    setError('');
    setMessage('');
    forgotPasswordMutation.mutate(data);
  };

  return (
    <>
      <h1 className="text-text-primary mb-1.5 text-center text-lg font-semibold sm:mb-2 sm:text-xl">
        {t('forgot.title')}
      </h1>
      <p className="text-text-tertiary mb-5 text-center text-xs sm:mb-6 sm:text-sm">{t('forgot.subtitle')}</p>

      {error && (
        <div className="border-danger bg-danger-light text-danger mb-3 rounded-lg border p-2.5 text-xs sm:mb-4 sm:p-3 sm:text-sm">
          {error}
        </div>
      )}

      {message && (
        <div className="border-success bg-success-light text-success mb-3 rounded-lg border p-2.5 text-xs sm:mb-4 sm:p-3 sm:text-sm">
          {message}
        </div>
      )}

      <Form methods={methods} onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <FormInput
          name="email"
          type="email"
          label={t('fields.email')}
          placeholder={t('forgot.emailPlaceholder')}
          autoComplete="email"
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-button-primary-bg-hover text-primary-foreground flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-3 sm:text-base"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
              <span>{t('forgot.sending')}</span>
            </>
          ) : (
            t('forgot.send')
          )}
        </button>
      </Form>
    </>
  );
};

export default ForgotPassword;
