'use client';

import { useState } from 'react';

import Link from 'next/link';

import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

      window.location.href = '/overview';
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin() {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'demo@kharji.app', password: 'demo123' }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Demo login failed');
        return;
      }

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
      <h1 className="mb-1.5 text-center text-lg font-bold text-[#171717] sm:mb-2 sm:text-xl">Welcome Back</h1>
      <p className="mb-5 text-center text-xs text-[#6b7280] sm:mb-6 sm:text-sm">Sign in to your account to continue</p>

      {error && (
        <div className="mb-3 rounded-lg border border-[#ef4444] bg-[#fef2f2] p-2.5 text-xs text-[#ef4444] sm:mb-4 sm:p-3 sm:text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-[#171717] sm:mb-2 sm:text-sm">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="test@example.com"
            className="w-full rounded-lg border border-[#e5e5e5] bg-white px-3 py-2.5 text-sm text-[#171717] placeholder:text-[#a3a3a3] focus:border-[#171717] focus:outline-none sm:px-4 sm:py-3 sm:text-base"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-[#171717] sm:mb-2 sm:text-sm">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="w-full rounded-lg border border-[#e5e5e5] bg-white px-3 py-2.5 pr-10 text-sm text-[#171717] placeholder:text-[#a3a3a3] focus:border-[#171717] focus:outline-none sm:px-4 sm:py-3 sm:pr-12 sm:text-base"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-[#a3a3a3] hover:text-[#525252] sm:right-3"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs font-medium text-[#171717] hover:underline sm:text-sm">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#171717] px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#404040] disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-3 sm:text-base"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="relative my-4 sm:my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#e5e5e5]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-[#a3a3a3]">OR</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleDemoLogin}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#e5e5e5] bg-white px-3 py-2.5 text-sm font-medium text-[#171717] transition-colors hover:bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-3 sm:text-base"
      >
        Continue with Demo Account
      </button>
    </>
  );
}
