'use client';

import { Suspense, useState } from 'react';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { resendVerificationKeyGenerator } from '@api/resendVerificationMutation';
import type { ResendVerificationRequestData, ResendVerificationResponse } from '@api/resendVerificationMutation';
import { useMutation } from '@tanstack/react-query';
import { Loader2, MailCheck } from 'lucide-react';

const VerifyEmailContent = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const resendMutation = useMutation<ResendVerificationResponse, Error, ResendVerificationRequestData>({
    mutationKey: resendVerificationKeyGenerator(),
    onSuccess: () => {
      setError('');
      setMessage('Verification email sent — check your inbox.');
    },
    onError: (err) => {
      setMessage('');
      setError(err.message || 'Could not resend verification email');
    },
  });

  return (
    <>
      <div className="mb-4 flex justify-center">
        <div className="bg-background-secondary border-border-subtle flex h-12 w-12 items-center justify-center rounded-full border">
          <MailCheck className="text-text-primary h-6 w-6" aria-hidden="true" />
        </div>
      </div>

      <h1 className="text-text-primary mb-1.5 text-center text-lg font-semibold sm:mb-2 sm:text-xl">
        Check your inbox
      </h1>
      <p className="text-text-tertiary mb-5 text-center text-xs sm:mb-6 sm:text-sm">
        We sent a verification link{email ? ` to ${email}` : ''}. Click it to activate your account — you can close this
        tab afterwards.
      </p>

      {message && (
        <div className="border-success bg-success/10 text-text-secondary mb-3 rounded-lg border p-2.5 text-xs sm:mb-4 sm:p-3 sm:text-sm">
          {message}
        </div>
      )}

      {error && (
        <div className="border-danger bg-danger-light text-danger mb-3 rounded-lg border p-2.5 text-xs sm:mb-4 sm:p-3 sm:text-sm">
          {error}
        </div>
      )}

      {email && (
        <button
          type="button"
          onClick={() => resendMutation.mutate({ email })}
          disabled={resendMutation.isPending}
          className="border-border-subtle bg-background text-text-primary hover:bg-background-secondary flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-3 sm:text-base"
        >
          {resendMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
              <span>Sending...</span>
            </>
          ) : (
            'Resend verification email'
          )}
        </button>
      )}

      <p className="text-text-tertiary mt-4 text-center text-xs sm:text-sm">
        Already verified?{' '}
        <Link href="/login" className="text-text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
};

// useSearchParams requires a Suspense boundary during prerendering
const VerifyEmail = () => (
  <Suspense fallback={null}>
    <VerifyEmailContent />
  </Suspense>
);

export default VerifyEmail;
