'use client';

import { useState } from 'react';

import Link from 'next/link';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import { useToast } from '@components/Toast/ToastProvider';

import { signup } from '@/lib/api/auth';
import { queryKeys } from '@/lib/query-keys';

const Signup = () => {
  // States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Mutations
  const signupMutation = useMutation({
    mutationFn: ({
      name,
      email,
      password,
      passwordConfirm,
    }: {
      name: string;
      email: string;
      password: string;
      passwordConfirm: string;
    }) => signup(name, email, password, passwordConfirm),
    onSuccess: (user) => {
      // Setting the `me` query data is enough — GuestGuard sees the user and
      // redirects (honoring ?rp=). Pushing /overview here too would race it.
      queryClient.setQueryData(queryKeys.auth.me(), user);
      showToast('Account created. Welcome to Kharji!', 'success');
    },
    onError: (err: Error) => {
      setError(err.message || 'Signup failed');
    },
  });

  // Variables
  const loading = signupMutation.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!agreeTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    if (password !== passwordConfirm) {
      setError('Passwords do not match');
      return;
    }

    signupMutation.mutate({ name: fullName, email, password, passwordConfirm });
  }

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

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div>
          <label htmlFor="fullName" className="text-text-primary mb-1.5 block text-xs font-medium sm:mb-2 sm:text-sm">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder="John Doe"
            className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-primary w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none sm:px-4 sm:py-3 sm:text-base"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="email" className="text-text-primary mb-1.5 block text-xs font-medium sm:mb-2 sm:text-sm">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-primary w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none sm:px-4 sm:py-3 sm:text-base"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="password" className="text-text-primary mb-1.5 block text-xs font-medium sm:mb-2 sm:text-sm">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Create a strong password"
              className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-primary w-full rounded-lg border px-3 py-2.5 pr-10 text-sm focus:outline-none sm:px-4 sm:py-3 sm:pr-12 sm:text-base"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-text-muted hover:text-text-secondary absolute top-1/2 right-2.5 -translate-y-1/2 sm:right-3"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="passwordConfirm"
            className="text-text-primary mb-1.5 block text-xs font-medium sm:mb-2 sm:text-sm"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="passwordConfirm"
              type={showConfirmPassword ? 'text' : 'password'}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              placeholder="Confirm your password"
              className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-primary w-full rounded-lg border px-3 py-2.5 pr-10 text-sm focus:outline-none sm:px-4 sm:py-3 sm:pr-12 sm:text-base"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-text-muted hover:text-text-secondary absolute top-1/2 right-2.5 -translate-y-1/2 sm:right-3"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>
          </div>
        </div>

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
          className="bg-primary hover:bg-button-primary-bg-hover flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-3 sm:text-base"
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
      </form>
    </>
  );
};

export default Signup;
