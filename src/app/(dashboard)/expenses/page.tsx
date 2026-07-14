import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import Expenses from '@features/pages/Expenses';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metaTitles');
  return { title: t('expenses') };
}

const ExpensesPage = () => (
  <>
    <Expenses />
  </>
);

export default ExpensesPage;
