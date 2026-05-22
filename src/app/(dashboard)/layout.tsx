import type { FC, PropsWithChildren } from 'react';

import AuthGuard from '@features/guards/AuthGuard';

import DashboardLayout from '@components/DashboardLayout';

const DashboardRootLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <AuthGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
};

export default DashboardRootLayout;
