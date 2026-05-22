import type { Metadata } from 'next';

import Expenses from '@features/pages/Expenses';

export const metadata: Metadata = { title: 'Expenses' };

const ExpensesPage = () => (
  <>
    <Expenses />
  </>
);

export default ExpensesPage;
