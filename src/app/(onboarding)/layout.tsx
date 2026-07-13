import type { ReactNode } from 'react';

import { Zap } from 'lucide-react';

import AuthGuard from '@features/guards/AuthGuard';

// Same visual shell as the auth pages (logo + centered card), but for
// signed-in users — no TopNav, no GuestGuard.
export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="bg-background-content flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="mb-4 flex flex-col items-center">
            <div className="mb-1 flex items-center gap-2">
              <div className="bg-primary rounded-md p-2">
                <Zap className="text-primary-foreground h-5 w-5" aria-hidden="true" />
              </div>
              <span className="text-text-primary text-xl font-bold">Kharji</span>
            </div>
            <p className="text-text-tertiary">Personal Finance Tracker</p>
          </div>

          <div className="border-border-subtle bg-background rounded-xl border p-5 shadow-sm sm:p-8">{children}</div>
        </div>
      </div>
    </AuthGuard>
  );
}
