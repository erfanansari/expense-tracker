import type { Metadata } from 'next';

import ResetPassword from '@features/pages/ResetPassword';

export const metadata: Metadata = { title: 'Reset Password' };

const ResetPasswordPage = () => (
  <>
    <ResetPassword />
  </>
);

export default ResetPasswordPage;
