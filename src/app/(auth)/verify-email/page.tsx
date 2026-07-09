import type { Metadata } from 'next';

import VerifyEmail from '@features/pages/VerifyEmail';

export const metadata: Metadata = { title: 'Verify Email' };

const VerifyEmailPage = () => (
  <>
    <VerifyEmail />
  </>
);

export default VerifyEmailPage;
