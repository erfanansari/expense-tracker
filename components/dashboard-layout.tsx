'use client';

import { Sidebar } from './sidebar';
import { BottomNav } from './bottom-nav';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#ffffff] overflow-x-hidden h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-0 pb-20 lg:pb-0 min-w-0 overflow-x-auto overflow-y-auto bg-[#ffffff]">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
