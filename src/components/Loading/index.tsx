'use client';

import type { FC } from 'react';

import { Loader2 } from 'lucide-react';

import type { LoadingProps } from './@types';

const Loading: FC<LoadingProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="rounded-xl border border-[#e5e5e5] bg-white p-16 shadow-sm">
      <div className="flex flex-col items-center gap-1">
        <Loader2 className="h-8 w-8 animate-spin text-[#0070f3]" />
        <p className="font-medium text-[#525252]">{message}</p>
      </div>
    </div>
  );
};

export default Loading;
