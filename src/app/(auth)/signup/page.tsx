import type { Metadata } from 'next';

import Signup from '@features/pages/Signup';

export const metadata: Metadata = { title: 'Sign Up' };

const SignupPage = () => (
  <>
    <Signup />
  </>
);

export default SignupPage;
