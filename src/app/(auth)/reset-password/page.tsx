'use client';

import { Suspense, useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import Button from '@/components/Button';
import Loading from '@/components/Loading';

function ResetPasswordContent() {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
    }
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, passwordConfirm }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Reset failed');
        return;
      }

      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (!tokenValid) {
    return (
      <>
        <h1 className="mb-4 text-center text-2xl font-bold text-[var(--foreground)]">Invalid reset link</h1>
        <p className="mb-6 text-center text-[var(--foreground-secondary)]">
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
      <h1 className="mb-2 text-center text-2xl font-bold text-[var(--foreground)]">Reset your password</h1>
      <p className="mb-6 text-center text-[var(--foreground-secondary)]">Create a new password below</p>

      {error && (
        <div className="mb-4 rounded-lg border border-[var(--accent-error)] bg-[var(--accent-error-muted)] p-4 text-sm text-[var(--accent-error)]">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-4 rounded-lg border border-[var(--accent-success)] bg-[var(--accent-success-muted)] p-4 text-sm text-[var(--accent-success)]">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-[var(--foreground)]">
            New password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Create a new password"
            className="bg-background w-full rounded-lg border border-[var(--border-default)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--accent-blue)] focus:outline-none"
            disabled={loading}
          />
          <p className="mt-2 text-xs text-[var(--foreground-muted)]">
            At least 8 characters, 1 uppercase, 1 lowercase, 1 number
          </p>
        </div>

        <div>
          <label htmlFor="passwordConfirm" className="mb-2 block text-sm font-medium text-[var(--foreground)]">
            Confirm password
          </label>
          <input
            id="passwordConfirm"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
            placeholder="Confirm your new password"
            className="bg-background w-full rounded-lg border border-[var(--border-default)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--accent-blue)] focus:outline-none"
            disabled={loading}
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full py-3">
          {loading ? 'Resetting...' : 'Reset password'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <p className="text-[var(--foreground-secondary)]">
          <Link href="/login" className="font-medium text-[var(--accent-blue)] hover:text-[var(--accent-blue-hover)]">
            Back to login
          </Link>
        </p>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Loading message="Loading..." />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
