'use client';

import { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import Button from '@/components/Button';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, passwordConfirm }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Signup failed');
        return;
      }

      router.push('/overview');
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="mb-2 text-center text-2xl font-bold text-[var(--foreground)]">Create account</h1>
      <p className="mb-6 text-center text-[var(--foreground-secondary)]">Start tracking your expenses today</p>

      {error && (
        <div className="mb-4 rounded-lg border border-[var(--accent-error)] bg-[var(--accent-error-muted)] p-4 text-sm text-[var(--accent-error)]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-[var(--foreground)]">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full rounded-lg border border-[var(--border-default)] bg-white px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--accent-blue)] focus:outline-none"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-[var(--foreground)]">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Create a password"
            className="w-full rounded-lg border border-[var(--border-default)] bg-white px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--accent-blue)] focus:outline-none"
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
            placeholder="Confirm your password"
            className="w-full rounded-lg border border-[var(--border-default)] bg-white px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--accent-blue)] focus:outline-none"
            disabled={loading}
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full py-3">
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <p className="text-[var(--foreground-secondary)]">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-[var(--accent-blue)] hover:text-[var(--accent-blue-hover)]">
            Log in here
          </Link>
        </p>
      </div>
    </>
  );
}
