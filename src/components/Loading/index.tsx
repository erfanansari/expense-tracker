'use client';

import type { FC } from 'react';

import { Loader2 } from 'lucide-react';

import type { LoadingProps } from './@types';

const Loading: FC<LoadingProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="rounded-xl border border-[#e5e5e5] bg-white p-8 shadow-sm sm:p-16">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-[#0070f3] sm:h-8 sm:w-8" />
        <p className="text-center text-sm font-medium text-[#525252] sm:text-base">{message}</p>
      </div>
    </div>
  );
};

export default Loading;
