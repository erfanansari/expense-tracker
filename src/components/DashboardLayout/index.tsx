'use client';

import type { FC } from 'react';

import TopNav from '@features/navigation/components/TopNav';

import Footer from '@/components/Footer';

import type { DashboardLayoutProps } from './@types';

const DashboardLayout: FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-dvh flex-col">
      <TopNav />
      <main className="bg-background-content flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
