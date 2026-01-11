'use client';

import { useState } from 'react';

import Link from 'next/link';

import Button from '@/components/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Request failed');
        return;
      }

      setMessage(data.message);
      setEmail('');
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="mb-2 text-center text-2xl font-bold text-[var(--foreground)]">Reset your password</h1>
      <p className="mb-6 text-center text-[var(--foreground-secondary)]">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>

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

        <Button type="submit" disabled={loading} className="w-full py-3">
          {loading ? 'Sending...' : 'Send reset link'}
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
