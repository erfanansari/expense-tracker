'use client';

import type { FC } from 'react';

import TopNav from '@features/navigation/components/TopNav';

import type { DashboardLayoutProps } from './@types';

const DashboardLayout: FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#ffffff]">
      <TopNav />
      <main className="bg-[#ffffff]">{children}</main>
    </div>
  );
};

export default DashboardLayout;
