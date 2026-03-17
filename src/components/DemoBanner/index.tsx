'use client';

import Alert from '@components/Alert';

import { useAuth } from '@hooks/use-auth';

export default function DemoBanner() {
  const { user } = useAuth();

  if (!user || !user.isDemo) return null;

  return (
    <div className="mx-auto max-w-[1600px] px-4 pt-4 sm:px-6 sm:pt-6">
      <Alert variant="info" description="You're exploring a demo account — data may be reset at any time." />
    </div>
  );
}
