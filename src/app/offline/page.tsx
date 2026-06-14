import type { Metadata } from 'next';

import { WifiOff, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Offline',
};

export default function OfflinePage() {
  return (
    <main className="bg-background flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="flex items-center gap-2">
        <div className="bg-primary rounded-md p-2">
          <Zap className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        <span className="text-text-primary text-xl font-bold">Kharji</span>
      </div>

      <div className="border-border-subtle bg-background-secondary mt-10 flex h-14 w-14 items-center justify-center rounded-full border">
        <WifiOff className="text-text-muted h-6 w-6" aria-hidden="true" />
      </div>

      <h1 className="text-text-primary mt-6 text-lg font-semibold">You&apos;re offline</h1>
      <p className="text-text-tertiary mt-2 max-w-sm text-sm">
        Kharji needs an internet connection to load your finances. Check your connection and try again.
      </p>
    </main>
  );
}
