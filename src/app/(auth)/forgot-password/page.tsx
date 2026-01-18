'use client';

import { useState } from 'react';

import { Loader2 } from 'lucide-react';

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
      <h1 className="text-text-primary mb-1.5 text-center text-lg font-bold sm:mb-2 sm:text-xl">Reset Password</h1>
      <p className="text-text-tertiary mb-5 text-center text-xs sm:mb-6 sm:text-sm">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>

      {error && (
        <div className="border-danger bg-danger-light text-danger mb-3 rounded-lg border p-2.5 text-xs sm:mb-4 sm:p-3 sm:text-sm">
          {error}
        </div>
      )}

      {message && (
        <div className="border-success bg-success-light text-success mb-3 rounded-lg border p-2.5 text-xs sm:mb-4 sm:p-3 sm:text-sm">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
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

        <button
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-button-primary-bg-hover flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-3 sm:text-base"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            'Send Reset Link'
          )}
        </button>
      </form>
    </>
  );
}
