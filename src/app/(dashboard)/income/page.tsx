import type { Metadata } from 'next';

import Income from '@features/pages/Income';

export const metadata: Metadata = { title: 'Income' };

const IncomePage = () => (
  <>
    <Income />
  </>
);

export default IncomePage;
