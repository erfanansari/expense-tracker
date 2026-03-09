import type { Metadata } from 'next';

import Login from '@features/pages/Login';

export const metadata: Metadata = { title: 'Login' };

const LoginPage = () => (
  <>
    <Login />
  </>
);

export default LoginPage;
