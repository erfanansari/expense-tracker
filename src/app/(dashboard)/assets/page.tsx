import type { Metadata } from 'next';

import Assets from '@features/pages/Assets';

export const metadata: Metadata = { title: 'Assets' };

const AssetsPage = () => (
  <>
    <Assets />;
  </>
);

export default AssetsPage;
