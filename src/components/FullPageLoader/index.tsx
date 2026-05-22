'use client';

import type { FC } from 'react';

import { Zap } from 'lucide-react';

const FullPageLoader: FC = () => (
  <div className="bg-background fixed inset-0 z-50 flex items-center justify-center">
    <div className="flex flex-col items-center gap-9">
      <div className="bg-primary flex h-20 w-20 items-center justify-center rounded-2xl shadow-sm">
        <Zap className="h-10 w-10 text-white" aria-hidden="true" />
      </div>
      <div
        role="status"
        aria-label="Loading"
        className="border-border-default h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
      />
    </div>
  </div>
);

export default FullPageLoader;
