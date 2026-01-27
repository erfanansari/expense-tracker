'use client';

import type { FC } from 'react';

import TopNav from '@features/navigation/components/TopNav';

import type { DashboardLayoutProps } from './@types';

const DashboardLayout: FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="bg-background flex min-h-dvh flex-col">
      <TopNav />
      <main className="bg-background flex-1">{children}</main>
    </div>
  );
};

export default DashboardLayout;
