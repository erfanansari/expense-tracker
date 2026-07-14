'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { changePasswordKeyGenerator } from '@api/changePasswordMutation';
import type { ChangePasswordRequestData } from '@api/changePasswordMutation';
import { listAccountsKeyGenerator } from '@api/listAccountsQuery';
import type { ListAccountsResponse } from '@api/listAccountsQuery';
import { listSessionsKeyGenerator } from '@api/listSessionsQuery';
import { setPasswordKeyGenerator } from '@api/setPasswordMutation';
import type { SetPasswordRequestData } from '@api/setPasswordMutation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { createChangePasswordSchema, createSetPasswordSchema } from '@schemas';

import Button from '@components/Button';
import Form from '@components/Form';
import FormInput from '@components/Form/components/FormInput';
import Modal from '@components/Modal';

import { useToast } from '@stores/toast';

const PasswordBlock = () => {
  // Customs
  const t = useTranslations('settings.security.password');
  const tZod = useTranslations();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  // Queries
  const { data: accounts, isLoading } = useQuery<ListAccountsResponse>({ queryKey: listAccountsKeyGenerator() });
  const hasCredential = (accounts ?? []).some((account) => account.providerId === 'credential');

  // Forms
  const changeMethods = useForm<ChangePasswordRequestData>({
    resolver: zodResolver(createChangePasswordSchema(tZod)),
    defaultValues: { currentPassword: '', password: '', passwordConfirm: '' },
    mode: 'all',
  });
  const setMethods = useForm<SetPasswordRequestData>({
    resolver: zodResolver(createSetPasswordSchema(tZod)),
    defaultValues: { password: '', passwordConfirm: '' },
    mode: 'all',
  });

  // Mutations
  const closeModal = () => {
    setIsModalOpen(false);
    setError('');
    changeMethods.reset();
    setMethods.reset();
  };

  const changePasswordMutation = useMutation<void, Error, ChangePasswordRequestData>({
    mutationKey: changePasswordKeyGenerator(),
    onSuccess: () => {
      closeModal();
      showToast(t('changed'), 'success');
      void queryClient.invalidateQueries({ queryKey: listSessionsKeyGenerator() });
    },
    onError: (err) => setError(err.message || t('changeFailed')),
  });

  const setPasswordMutation = useMutation<void, Error, SetPasswordRequestData>({
    mutationKey: setPasswordKeyGenerator(),
    onSuccess: () => {
      closeModal();
      showToast(t('set'), 'success');
      void queryClient.invalidateQueries({ queryKey: listAccountsKeyGenerator() });
    },
    onError: (err) => setError(err.message || t('setFailed')),
  });

  // Variables
  const submitting = changePasswordMutation.isPending || setPasswordMutation.isPending;

  return (
    <div className="max-w-2xl">
      <h3 className="text-text-primary text-sm font-semibold">{t('title')}</h3>
      <p className="text-text-muted mt-1 text-xs">{hasCredential ? t('changeHint') : t('setHint')}</p>
      <div className="mt-4">
        <Button variant="outline" onClick={() => setIsModalOpen(true)} disabled={isLoading}>
          {hasCredential ? t('changeAction') : t('setAction')}
        </Button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={submitting ? () => {} : closeModal}
        title={hasCredential ? t('changeAction') : t('setAction')}
      >
        {error && (
          <div className="border-danger bg-danger-light text-danger mb-4 rounded-lg border p-2.5 text-xs sm:text-sm">
            {error}
          </div>
        )}

        {hasCredential ? (
          <Form
            methods={changeMethods}
            onSubmit={(data) => {
              setError('');
              changePasswordMutation.mutate(data);
            }}
            className="space-y-4"
          >
            <FormInput
              name="currentPassword"
              type="password"
              label={t('currentPassword')}
              autoComplete="current-password"
              disabled={submitting}
            />
            <FormInput
              name="password"
              type="password"
              label={t('newPassword')}
              autoComplete="new-password"
              disabled={submitting}
            />
            <FormInput
              name="passwordConfirm"
              type="password"
              label={t('confirmNewPassword')}
              autoComplete="new-password"
              disabled={submitting}
            />
            <PasswordModalActions submitting={submitting} onCancel={closeModal} submitLabel={t('changeAction')} />
          </Form>
        ) : (
          <Form
            methods={setMethods}
            onSubmit={(data) => {
              setError('');
              setPasswordMutation.mutate(data);
            }}
            className="space-y-4"
          >
            <FormInput
              name="password"
              type="password"
              label={t('newPassword')}
              autoComplete="new-password"
              disabled={submitting}
            />
            <FormInput
              name="passwordConfirm"
              type="password"
              label={t('confirmPassword')}
              autoComplete="new-password"
              disabled={submitting}
            />
            <PasswordModalActions submitting={submitting} onCancel={closeModal} submitLabel={t('setAction')} />
          </Form>
        )}
      </Modal>
    </div>
  );
};

const PasswordModalActions = ({
  submitting,
  onCancel,
  submitLabel,
}: {
  submitting: boolean;
  onCancel: () => void;
  submitLabel: string;
}) => {
  const t = useTranslations('settings.security.password');
  return (
    // Cancel sits on the physical right, Save/primary on the left, under RTL.
    // rtl:justify-start (not rtl:flex-row-reverse) keeps Cancel — coded first
    // — as the rightmost element while still anchoring the pair to the row's
    // own right edge (its LTR resting side).
    <div className="flex justify-end gap-3 pt-2 rtl:justify-start">
      <Button variant="outline" type="button" onClick={onCancel} disabled={submitting}>
        {t('cancel')}
      </Button>
      <Button variant="primary" type="submit" disabled={submitting}>
        {submitting ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            {t('saving')}
          </span>
        ) : (
          submitLabel
        )}
      </Button>
    </div>
  );
};

export default PasswordBlock;
