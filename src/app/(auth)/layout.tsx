'use client';

import type { ReactNode } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Zap } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname();
  const isLogin = pathname === '/login';
  const isSignup = pathname === '/signup';
  const isForgotPassword = pathname === '/forgot-password';

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="mb-4 flex flex-col items-center">
          <div className="mb-1 flex items-center gap-2">
            <div className="bg-primary rounded-md p-2">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-text-primary text-xl font-bold">Kharji</span>
          </div>
          <p className="text-text-tertiary">Personal Finance Tracker</p>
        </div>

        {/* Auth Card */}
        <div className="border-border-subtle bg-background rounded-xl border p-5 shadow-sm sm:p-8">{children}</div>

        {/* Footer Link */}
        {isLogin && (
          <p className="text-text-tertiary mt-4 text-center text-sm sm:mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-text-primary font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        )}
        {isSignup && (
          <p className="text-text-tertiary mt-4 text-center text-sm sm:mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        )}
        {isForgotPassword && (
          <p className="text-text-tertiary mt-4 text-center text-sm sm:mt-6">
            <Link href="/login" className="text-text-primary font-semibold hover:underline">
              Back to login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
