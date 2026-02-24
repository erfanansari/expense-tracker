import type { FC, PropsWithChildren } from 'react';

import DashboardLayout from '@components/DashboardLayout';

const DashboardRootLayout: FC<PropsWithChildren> = ({ children }) => {
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default DashboardRootLayout;
