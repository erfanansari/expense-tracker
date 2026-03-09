import type { Metadata } from 'next';

import Settings from '@features/pages/Settings';

export const metadata: Metadata = { title: 'Settings' };

const SettingsPage = () => (
  <>
    <Settings />
  </>
);

export default SettingsPage;
