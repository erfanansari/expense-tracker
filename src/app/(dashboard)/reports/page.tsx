import type { Metadata } from 'next';

import Reports from '@features/pages/Reports';

export const metadata: Metadata = { title: 'Reports' };

const ReportsPage = () => (
  <>
    <Reports />
  </>
);

export default ReportsPage;
