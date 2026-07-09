'use client';

import { useState } from 'react';

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

import { changePasswordSchema, setPasswordSchema } from '@schemas';

import Button from '@components/Button';
import Form from '@components/Form';
import FormInput from '@components/Form/components/FormInput';
import Modal from '@components/Modal';

import { useToast } from '@stores/toast';

const PasswordBlock = () => {
  // Customs
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
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', password: '', passwordConfirm: '' },
    mode: 'all',
  });
  const setMethods = useForm<SetPasswordRequestData>({
    resolver: zodResolver(setPasswordSchema),
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
      showToast('Password changed. Other devices were signed out.', 'success');
      void queryClient.invalidateQueries({ queryKey: listSessionsKeyGenerator() });
    },
    onError: (err) => setError(err.message || 'Failed to change password'),
  });

  const setPasswordMutation = useMutation<void, Error, SetPasswordRequestData>({
    mutationKey: setPasswordKeyGenerator(),
    onSuccess: () => {
      closeModal();
      showToast('Password set. You can now sign in with email and password.', 'success');
      void queryClient.invalidateQueries({ queryKey: listAccountsKeyGenerator() });
    },
    onError: (err) => setError(err.message || 'Failed to set password'),
  });

  // Variables
  const submitting = changePasswordMutation.isPending || setPasswordMutation.isPending;

  return (
    <div className="max-w-2xl">
      <h3 className="text-text-primary text-sm font-semibold">Password</h3>
      <p className="text-text-muted mt-1 text-xs">
        {hasCredential
          ? 'Change the password you use to sign in. Changing it signs out your other devices.'
          : 'You signed up with Google. Set a password to also sign in with email and password.'}
      </p>
      <div className="mt-4">
        <Button variant="outline" onClick={() => setIsModalOpen(true)} disabled={isLoading}>
          {hasCredential ? 'Change Password' : 'Set Password'}
        </Button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={submitting ? () => {} : closeModal}
        title={hasCredential ? 'Change Password' : 'Set Password'}
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
              label="Current Password"
              autoComplete="current-password"
              disabled={submitting}
            />
            <FormInput
              name="password"
              type="password"
              label="New Password"
              autoComplete="new-password"
              disabled={submitting}
            />
            <FormInput
              name="passwordConfirm"
              type="password"
              label="Confirm New Password"
              autoComplete="new-password"
              disabled={submitting}
            />
            <PasswordModalActions submitting={submitting} onCancel={closeModal} submitLabel="Change Password" />
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
              label="New Password"
              autoComplete="new-password"
              disabled={submitting}
            />
            <FormInput
              name="passwordConfirm"
              type="password"
              label="Confirm Password"
              autoComplete="new-password"
              disabled={submitting}
            />
            <PasswordModalActions submitting={submitting} onCancel={closeModal} submitLabel="Set Password" />
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
}) => (
  <div className="flex justify-end gap-3 pt-2">
    <Button variant="outline" type="button" onClick={onCancel} disabled={submitting}>
      Cancel
    </Button>
    <Button variant="primary" type="submit" disabled={submitting}>
      {submitting ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Saving...
        </span>
      ) : (
        submitLabel
      )}
    </Button>
  </div>
);

export default PasswordBlock;
