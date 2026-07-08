import type { Metadata } from 'next';

import Privacy from '@features/pages/Privacy';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Kharji collects, uses, and protects your data.',
};

const PrivacyPage = () => (
  <>
    <Privacy />
  </>
);

export default PrivacyPage;
