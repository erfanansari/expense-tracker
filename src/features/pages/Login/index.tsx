'use client';

import { useState } from 'react';

import Link from 'next/link';

import { getMeKeyGenerator } from '@api/getMeQuery';
import { loginKeyGenerator } from '@api/loginMutation';
import type { LoginRequestData, LoginResponse } from '@api/loginMutation';
import { resendVerificationKeyGenerator } from '@api/resendVerificationMutation';
import type { ResendVerificationRequestData, ResendVerificationResponse } from '@api/resendVerificationMutation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { loginSchema } from '@schemas';

import { DEMO_EMAIL, DEMO_PASSWORD } from '@constants';

import Form from '@components/Form';
import FormInput from '@components/Form/components/FormInput';
import GoogleSignInButton from '@components/GoogleSignInButton';

import { useToast } from '@stores/toast';

const Login = () => {
  // Customs
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // States
  const [error, setError] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  // Forms
  const methods = useForm<LoginRequestData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'all',
  });

  // Mutations
  const loginMutation = useMutation<LoginResponse, Error, LoginRequestData>({
    mutationKey: loginKeyGenerator(),
    onSuccess: ({ user }) => {
      // Setting the `me` query data is enough — GuestGuard sees the user and
      // redirects (honoring ?rp=). Pushing /overview here too would race it.
      queryClient.setQueryData(getMeKeyGenerator(), user);
      showToast(`Welcome back${user.name ? `, ${user.name}` : ''}!`, 'success');
    },
    onError: (err, variables) => {
      if (err.message.toLowerCase().includes('email not verified')) {
        setUnverifiedEmail(variables.email);
        setError('');
        return;
      }
      setError(err.message || 'Login failed');
    },
  });

  const resendMutation = useMutation<ResendVerificationResponse, Error, ResendVerificationRequestData>({
    mutationKey: resendVerificationKeyGenerator(),
    onSuccess: () => {
      showToast('Verification email sent — check your inbox.', 'success');
    },
    onError: (err) => {
      setError(err.message || 'Could not resend verification email');
    },
  });

  // Variables
  const loading = loginMutation.isPending;

  const handleSubmit = (data: LoginRequestData) => {
    setError('');
    setUnverifiedEmail('');
    loginMutation.mutate(data);
  };

  const handleDemoLogin = () => {
    setError('');
    loginMutation.mutate({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
  };

  return (
    <>
      <h1 className="text-text-primary mb-1.5 text-center text-lg font-semibold sm:mb-2 sm:text-xl">Welcome Back</h1>
      <p className="text-text-tertiary mb-5 text-center text-xs sm:mb-6 sm:text-sm">
        Sign in to your account to continue
      </p>

      {error && (
        <div className="border-danger bg-danger-light text-danger mb-3 rounded-lg border p-2.5 text-xs sm:mb-4 sm:p-3 sm:text-sm">
          {error}
        </div>
      )}

      {unverifiedEmail && (
        <div className="border-warning bg-warning/10 text-text-secondary mb-3 rounded-lg border p-2.5 text-xs sm:mb-4 sm:p-3 sm:text-sm">
          Your email isn&apos;t verified yet. Check your inbox for the verification link, or{' '}
          <button
            type="button"
            onClick={() => resendMutation.mutate({ email: unverifiedEmail })}
            disabled={resendMutation.isPending}
            className="text-text-primary font-medium hover:underline disabled:opacity-50"
          >
            {resendMutation.isPending ? 'sending...' : 'resend it'}
          </button>
          .
        </div>
      )}

      <Form methods={methods} onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <FormInput
          name="email"
          type="email"
          label="Email"
          placeholder="test@example.com"
          autoComplete="email"
          disabled={loading}
        />

        <FormInput
          name="password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          disabled={loading}
        />

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-text-primary text-xs font-medium hover:underline sm:text-sm">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-button-primary-bg-hover text-primary-foreground flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-3 sm:text-base"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            'Sign In'
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

      <div className="space-y-3">
        <GoogleSignInButton disabled={loading} onError={setError} />

        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading}
          className="border-border-subtle bg-background text-text-primary hover:bg-background-secondary flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-3 sm:text-base"
        >
          Continue with Demo Account
        </button>

        <p className="text-text-muted text-center text-xs">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="text-text-secondary hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-text-secondary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </>
  );
};

export default Login;
