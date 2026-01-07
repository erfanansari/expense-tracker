'use client';

import { Loader2 } from 'lucide-react';

interface LoadingProps {
  message?: string;
}

export function Loading({ message = 'Loading...' }: LoadingProps) {
  return (
    <div className="bg-white rounded-xl p-16 border border-[#e5e5e5] shadow-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
          <Loader2 className="h-6 w-6 animate-spin text-[#0070f3]" />
        </div>
        <p className="text-sm text-[#525252] font-medium">{message}</p>
      </div>
    </div>
  );
}
