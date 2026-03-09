import type { Metadata } from 'next';

import Landing from '@features/pages/Landing';

export const metadata: Metadata = {
  title: 'Kharji - Personal Finance Tracker',
  description:
    'Track expenses, manage income, and grow your wealth with Kharji personal finance tracker. Free and open source.',
};

const LandingPage = () => (
  <>
    <Landing />
  </>
);

export default LandingPage;
