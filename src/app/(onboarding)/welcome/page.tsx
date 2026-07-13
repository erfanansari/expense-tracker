import type { Metadata } from 'next';

import Welcome from '@features/pages/Welcome';

export const metadata: Metadata = { title: 'Welcome' };

const WelcomePage = () => (
  <>
    <Welcome />
  </>
);

export default WelcomePage;
