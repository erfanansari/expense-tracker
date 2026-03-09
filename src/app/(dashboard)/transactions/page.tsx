import type { Metadata } from 'next';

import Transactions from '@features/pages/Transactions';

export const metadata: Metadata = { title: 'Transactions' };

const TransactionsPage = () => (
  <>
    <Transactions />
  </>
);

export default TransactionsPage;
