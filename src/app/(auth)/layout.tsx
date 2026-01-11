import type { ReactNode } from 'react';

import { Zap } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background-secondary)] px-4 py-8">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="rounded-md bg-[#000000] p-2">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-[var(--foreground)]">Kharji</span>
        </div>

        {/* Auth Card */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-white p-8 shadow-[var(--shadow-lg)]">
          {children}
        </div>
      </div>
    </div>
  );
}
