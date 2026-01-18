'use client';

import type { FC } from 'react';

import TopNav from '@features/navigation/components/TopNav';

import type { DashboardLayoutProps } from './@types';

const DashboardLayout: FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="bg-background min-h-screen">
      <TopNav />
      <main className="bg-background">{children}</main>
    </div>
  );
};

export default DashboardLayout;
