'use client';

import { Suspense, useState } from 'react';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { resetPasswordKeyGenerator } from '@api/resetPasswordMutation';
import type { ResetPasswordRequestData } from '@api/resetPasswordMutation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import { resetPasswordSchema } from '@schemas';

import Button from '@components/Button';
import Form from '@components/Form';
import FormInput from '@components/Form/components/FormInput';
import Loading from '@components/Loading';

function ResetPasswordContent() {
  // Customs
  const searchParams = useSearchParams();
  const router = useRouter();

  // States
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Variables
  const token = searchParams.get('token');
  const tokenValid = !!token;

  // Forms
  const methods = useForm<ResetPasswordRequestData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: token ?? '', password: '', passwordConfirm: '' },
    mode: 'all',
  });

  // Mutations
  const resetMutation = useMutation<void, Error, ResetPasswordRequestData>({
    mutationKey: resetPasswordKeyGenerator(),
    onSuccess: () => {
      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    },
    onError: (err) => {
      setError(err.message || 'Reset failed');
    },
  });

  // Variables
  const loading = resetMutation.isPending;

  const handleSubmit = (data: ResetPasswordRequestData) => {
    setError('');
    setMessage('');
    resetMutation.mutate(data);
  };

  if (!tokenValid) {
    return (
      <>
        <h1 className="text-text-primary mb-4 text-center text-2xl font-semibold">Invalid reset link</h1>
        <p className="text-text-secondary mb-6 text-center">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Link href="/forgot-password">
          <Button className="w-full py-3">Request new reset link</Button>
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="text-text-primary mb-2 text-center text-2xl font-semibold">Reset your password</h1>
      <p className="text-text-secondary mb-6 text-center">Create a new password below</p>

      {error && (
        <div className="border-danger bg-danger-light text-danger mb-4 rounded-lg border p-4 text-sm">{error}</div>
      )}

      {message && (
        <div className="border-success bg-success-light text-success mb-4 rounded-lg border p-4 text-sm">{message}</div>
      )}

      <Form methods={methods} onSubmit={handleSubmit} className="space-y-5">
        <div>
          <FormInput
            name="password"
            type="password"
            label="New password"
            placeholder="Create a new password"
            autoComplete="new-password"
            disabled={loading}
          />
          <p className="text-text-muted mt-2 text-xs">At least 8 characters, 1 uppercase, 1 lowercase, 1 number</p>
        </div>

        <FormInput
          name="passwordConfirm"
          type="password"
          label="Confirm password"
          placeholder="Confirm your new password"
          autoComplete="new-password"
          disabled={loading}
        />

        <Button type="submit" disabled={loading} className="w-full py-3">
          {loading ? 'Resetting...' : 'Reset password'}
        </Button>
      </Form>

      <div className="mt-6 text-center text-sm">
        <p className="text-text-secondary">
          <Link href="/login" className="text-blue hover:text-blue-hover font-medium">
            Back to login
          </Link>
        </p>
      </div>
    </>
  );
}

const ResetPassword = () => {
  return (
    <Suspense fallback={<Loading message="Loading..." />}>
      <ResetPasswordContent />
    </Suspense>
  );
};

export default ResetPassword;
