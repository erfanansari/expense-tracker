'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { sendContactKeyGenerator } from '@api/sendContactMutation';
import type { SendContactRequestData, SendContactResponse } from '@api/sendContactMutation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { createContactSchema } from '@schemas';

import Form from '@components/Form';
import FormInput from '@components/Form/components/FormInput';
import FormTextarea from '@components/Form/components/FormTextarea';

const ContactForm = () => {
  const t = useTranslations('legal.contact.form');
  const tZod = useTranslations();

  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const methods = useForm<SendContactRequestData>({
    resolver: zodResolver(createContactSchema(tZod)),
    defaultValues: { name: '', email: '', subject: '', message: '', website: '' },
    mode: 'all',
  });

  const sendMutation = useMutation<SendContactResponse, Error, SendContactRequestData>({
    mutationKey: sendContactKeyGenerator(),
    onSuccess: () => {
      setSent(true);
      methods.reset();
    },
    onError: () => {
      setError(t('error'));
    },
  });

  const loading = sendMutation.isPending;

  const handleSubmit = (data: SendContactRequestData) => {
    setError('');
    sendMutation.mutate(data);
  };

  if (sent) {
    return (
      <div className="border-success bg-success-light text-success rounded-lg border p-3 text-sm sm:p-4 sm:text-base">
        {t('success')}
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="border-danger bg-danger-light text-danger rounded-lg border p-3 text-sm sm:p-4 sm:text-base">
          {error}
        </div>
      )}

      <Form methods={methods} onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormInput
            name="name"
            label={t('name')}
            placeholder={t('namePlaceholder')}
            autoComplete="name"
            disabled={loading}
          />
          <FormInput
            name="email"
            type="email"
            label={t('email')}
            placeholder={t('emailPlaceholder')}
            autoComplete="email"
            disabled={loading}
          />
        </div>

        <FormInput name="subject" label={t('subject')} placeholder={t('subjectPlaceholder')} disabled={loading} />

        <FormTextarea
          name="message"
          label={t('message')}
          placeholder={t('messagePlaceholder')}
          rows={6}
          disabled={loading}
        />

        {/* Honeypot — hidden from humans; bots that fill it are dropped server-side. */}
        <input
          {...methods.register('website')}
          type="text"
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-button-primary-bg-hover text-primary-foreground flex items-center justify-center gap-2 self-start rounded-lg px-6 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:py-3 sm:text-base"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
              <span>{t('sending')}</span>
            </>
          ) : (
            t('send')
          )}
        </button>
      </Form>
    </>
  );
};

export default ContactForm;
