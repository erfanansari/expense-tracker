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
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-8">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="mb-4 flex flex-col items-center">
          <div className="mb-1 flex items-center gap-2">
            <div className="rounded-md bg-[#171717] p-2">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#171717]">Kharji</span>
          </div>
          <p className="text-[#6b7280]">Personal Finance Tracker</p>
        </div>

        {/* Auth Card */}
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm sm:p-8">{children}</div>

        {/* Footer Link */}
        {isLogin && (
          <p className="mt-4 text-center text-sm text-[#6b7280] sm:mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-[#171717] hover:underline">
              Sign up
            </Link>
          </p>
        )}
        {isSignup && (
          <p className="mt-4 text-center text-sm text-[#6b7280] sm:mt-6">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-[#171717] hover:underline">
              Sign in
            </Link>
          </p>
        )}
        {isForgotPassword && (
          <p className="mt-4 text-center text-sm text-[#6b7280] sm:mt-6">
            <Link href="/login" className="font-semibold text-[#171717] hover:underline">
              Back to login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
