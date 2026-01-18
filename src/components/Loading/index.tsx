'use client';

import type { FC } from 'react';

import { Loader2 } from 'lucide-react';

import type { LoadingProps } from './@types';

const Loading: FC<LoadingProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="border-border-subtle bg-background rounded-xl border p-8 shadow-sm sm:p-16">
      <div className="flex w-full items-center justify-center gap-2">
        <Loader2 className="text-text-secondary h-6 w-6 animate-spin" />
        <p className="text-text-secondary text-center text-sm font-medium sm:text-base">{message}</p>
      </div>
    </div>
  );
};

export default Loading;
