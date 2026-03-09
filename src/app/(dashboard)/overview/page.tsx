import type { Metadata } from 'next';

import Overview from '@features/pages/Overview';

export const metadata: Metadata = {
  title: 'Overview',
};

const OverviewPage = () => {
  return (
    <>
      <Overview />
    </>
  );
};

export default OverviewPage;
