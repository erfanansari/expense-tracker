'use client';

import { useState } from 'react';

import Link from 'next/link';

import Button from '@/components/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      // Use hard navigation to ensure middleware runs with new cookie
      window.location.href = '/overview';
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="mb-2 text-center text-2xl font-bold text-[var(--foreground)]">Log in</h1>
      <p className="mb-6 text-center text-[var(--foreground-secondary)]">Welcome back to Kharji</p>

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
            placeholder="Enter your password"
            className="w-full rounded-lg border border-[var(--border-default)] bg-white px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--accent-blue)] focus:outline-none"
            disabled={loading}
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full py-3">
          {loading ? 'Logging in...' : 'Log in'}
        </Button>
      </form>

      <div className="mt-6 space-y-3 text-center text-sm">
        <p>
          <Link
            href="/forgot-password"
            className="font-medium text-[var(--accent-blue)] hover:text-[var(--accent-blue-hover)]"
          >
            Forgot your password?
          </Link>
        </p>
        <p className="text-[var(--foreground-secondary)]">
          New to Kharji?{' '}
          <Link href="/signup" className="font-medium text-[var(--accent-blue)] hover:text-[var(--accent-blue-hover)]">
            Create an account
          </Link>
        </p>
      </div>
    </>
  );
}
