'use client';

import { useTranslations } from 'next-intl';

import { sendFeedbackKeyGenerator } from '@api/sendFeedbackMutation';
import type { SendFeedbackRequestData, SendFeedbackResponse } from '@api/sendFeedbackMutation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { twMerge } from 'tailwind-merge';

import { createFeedbackSchema, FEEDBACK_TYPES } from '@schemas';

import Form from '@components/Form';
import FormTextarea from '@components/Form/components/FormTextarea';
import Modal from '@components/Modal';

import { useDrawerStore } from '@stores/drawer';
import { useToast } from '@stores/toast';

const FeedbackModal = () => {
  const t = useTranslations('feedback');
  const tZod = useTranslations();
  const { showToast } = useToast();

  const isOpen = useDrawerStore((state) => state.feedbackOpen);
  const closeFeedbackModal = useDrawerStore((state) => state.closeFeedbackModal);

  const methods = useForm<SendFeedbackRequestData>({
    resolver: zodResolver(createFeedbackSchema(tZod)),
    defaultValues: { type: 'other', message: '' },
    mode: 'all',
  });

  const sendMutation = useMutation<SendFeedbackResponse, Error, SendFeedbackRequestData>({
    mutationKey: sendFeedbackKeyGenerator(),
    onSuccess: () => {
      showToast(t('success'), 'success');
      methods.reset();
      closeFeedbackModal();
    },
    onError: () => {
      showToast(t('error'), 'error');
    },
  });

  const loading = sendMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={closeFeedbackModal} title={t('title')}>
      <Form
        methods={methods}
        onSubmit={(data: SendFeedbackRequestData) => sendMutation.mutate(data)}
        className="flex flex-col gap-4"
      >
        <Controller
          name="type"
          control={methods.control}
          render={({ field }) => (
            <div role="radiogroup" aria-label={t('typeLabel')} className="flex gap-2">
              {FEEDBACK_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  role="radio"
                  aria-checked={field.value === type}
                  onClick={() => field.onChange(type)}
                  className={twMerge(
                    'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                    field.value === type
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border-subtle bg-background text-text-secondary hover:bg-background-secondary hover:text-text-primary'
                  )}
                >
                  {t(`type${type.charAt(0).toUpperCase()}${type.slice(1)}` as 'typeBug' | 'typeIdea' | 'typeOther')}
                </button>
              ))}
            </div>
          )}
        />

        <FormTextarea
          name="message"
          label={t('messageLabel')}
          placeholder={t('messagePlaceholder')}
          rows={5}
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-button-primary-bg-hover text-primary-foreground flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
              <span>{t('sending')}</span>
            </>
          ) : (
            t('submit')
          )}
        </button>
      </Form>
    </Modal>
  );
};

export default FeedbackModal;
