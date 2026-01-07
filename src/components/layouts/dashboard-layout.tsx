'use client';

import { TopNav } from '@/features/navigation/components/top-nav';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#ffffff]">
      <TopNav />
      <main className="bg-[#ffffff]">
        {children}
      </main>
    </div>
  );
}
