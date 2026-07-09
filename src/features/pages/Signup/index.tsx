'use client';

import { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { signupKeyGenerator } from '@api/signupMutation';
import type { SignupRequestData, SignupResponse } from '@api/signupMutation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { signupSchema } from '@schemas';

import Form from '@components/Form';
import FormInput from '@components/Form/components/FormInput';
import GoogleSignInButton from '@components/GoogleSignInButton';

const Signup = () => {
  // Customs
  const router = useRouter();

  // States
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');

  // Forms
  const methods = useForm<SignupRequestData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '', passwordConfirm: '' },
    mode: 'all',
  });

  // Mutations
  const signupMutation = useMutation<SignupResponse, Error, SignupRequestData>({
    mutationKey: signupKeyGenerator(),
    onSuccess: ({ email }) => {
      // No session yet — the account must be verified first. Hand off to the
      // "check your inbox" screen.
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    },
    onError: (err) => {
      setError(err.message || 'Signup failed');
    },
  });

  // Variables
  const loading = signupMutation.isPending;

  const handleSubmit = (data: SignupRequestData) => {
    setError('');

    if (!agreeTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    signupMutation.mutate(data);
  };

  return (
    <>
      <h1 className="text-text-primary mb-1.5 text-center text-lg font-semibold sm:mb-2 sm:text-xl">Create Account</h1>
      <p className="text-text-tertiary mb-5 text-center text-xs sm:mb-6 sm:text-sm">
        Start tracking your expenses today
      </p>

      {error && (
        <div className="border-danger bg-danger-light text-danger mb-3 rounded-lg border p-2.5 text-xs sm:mb-4 sm:p-3 sm:text-sm">
          {error}
        </div>
      )}

      <Form methods={methods} onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <FormInput name="name" label="Full Name" placeholder="John Doe" autoComplete="name" disabled={loading} />

        <FormInput
          name="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          disabled={loading}
        />

        <FormInput
          name="password"
          type="password"
          label="Password"
          placeholder="Create a strong password"
          autoComplete="new-password"
          disabled={loading}
        />

        <FormInput
          name="passwordConfirm"
          type="password"
          label="Confirm Password"
          placeholder="Confirm your password"
          autoComplete="new-password"
          disabled={loading}
        />

        <label className="flex cursor-pointer items-start gap-2">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="border-border-subtle text-text-primary focus:ring-primary mt-0.5 h-3.5 w-3.5 rounded sm:h-4 sm:w-4"
          />
          <span className="text-text-secondary text-xs sm:text-sm">
            I agree to the{' '}
            <Link href="/terms" className="text-blue font-medium hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue font-medium hover:underline">
              Privacy Policy
            </Link>
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-button-primary-bg-hover text-primary-foreground flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-3 sm:text-base"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </Form>

      <div className="relative my-4 sm:my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="border-border-subtle w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background text-text-muted px-2">OR</span>
        </div>
      </div>

      <GoogleSignInButton disabled={loading} onError={setError} />

      <p className="text-text-muted mt-3 text-center text-xs">
        By continuing with Google, you agree to our{' '}
        <Link href="/terms" className="text-text-secondary hover:underline">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="text-text-secondary hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </>
  );
};

export default Signup;
