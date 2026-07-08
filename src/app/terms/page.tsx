import type { Metadata } from 'next';

import Terms from '@features/pages/Terms';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms that govern your use of Kharji.',
};

const TermsPage = () => (
  <>
    <Terms />
  </>
);

export default TermsPage;
