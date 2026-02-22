import type { Metadata } from 'next';

import Dashboard from '@features/pages/Overview';

export const metadata: Metadata = {
  title: 'Overview',
};

const DashboardPage = () => {
  return (
    <>
      <Dashboard />
    </>
  );
};

export default DashboardPage;
