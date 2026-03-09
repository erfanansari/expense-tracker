import type { Metadata } from 'next';

import ForgotPassword from '@features/pages/ForgotPassword';

export const metadata: Metadata = { title: 'Forgot Password' };

const ForgotPasswordPage = () => (
  <>
    <ForgotPassword />
  </>
);

export default ForgotPasswordPage;
