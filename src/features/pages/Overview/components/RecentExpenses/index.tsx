import { useMemo } from 'react';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { type ColumnDef } from '@tanstack/react-table';
import { ArrowRight, Receipt, Tag } from 'lucide-react';

import type { Expense } from '@types';

import DataTable from '@components/DataTable';
import EmptyState from '@components/EmptyState';
import Money from '@components/Money';

// ─── Table layout config ──────────────────────────────────────────────────────
// Centralized so column widths can be tuned in one place. Percentages must sum
// to 100. No min-width: descriptions truncate and amounts stay nowrap, so the
// two-column table shrinks with the card instead of scrolling.

export const RECENT_EXPENSES_COLUMN_WIDTHS = {
  description: 'w-[60%]',
  amount: 'w-[40%]',
} as const;

// ─── Columns ──────────────────────────────────────────────────────────────────

function buildOverviewColumns(tTables: ReturnType<typeof useTranslations<'tables'>>): ColumnDef<Expense, unknown>[] {
  return [
    {
      id: 'description',
      accessorKey: 'description',
      header: tTables('expenses.description'),
      meta: { widthClass: RECENT_EXPENSES_COLUMN_WIDTHS.description },
      cell: ({ row }) => {
        const expense = row.original;
        return (
          <div className="flex min-w-0 flex-col gap-2">
            <span className="text-text-primary truncate text-sm font-medium">{expense.description}</span>
            {expense.tags && expense.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {expense.tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="border-border-subtle bg-background-elevated text-text-secondary flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium"
                  >
                    <Tag className="h-3 w-3" aria-hidden="true" />
                    <span>{tag.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: 'amount',
      accessorKey: 'amount',
      header: tTables('expenses.amount'),
      meta: { widthClass: RECENT_EXPENSES_COLUMN_WIDTHS.amount, align: 'end' },
      cell: ({ row }) => {
        const expense = row.original;
        return (
          <Money
            amount={expense.amount}
            currency={expense.currency}
            date={expense.date}
            entryRate={expense.entryRate}
            className="items-end"
            primaryClassName="text-text-primary text-sm font-semibold whitespace-nowrap"
            secondaryClassName="text-text-muted text-xs whitespace-nowrap"
          />
        );
      },
    },
  ];
}

interface RecentExpensesProps {
  expenses: Expense[];
}

const RecentExpenses = ({ expenses }: RecentExpensesProps) => {
  // Customs
  const t = useTranslations('pages.overview.recentExpenses');
  const tOnboarding = useTranslations('onboarding.emptyStates');
  const tTables = useTranslations('tables');
  const overviewColumns = useMemo(() => buildOverviewColumns(tTables), [tTables]);

  // Memos
  const recentExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => {
        if (a.date !== b.date) return new Date(b.date).getTime() - new Date(a.date).getTime();
        return b.id - a.id;
      })
      .slice(0, 7);
  }, [expenses]);

  return (
    <DataTable
      data={recentExpenses}
      columns={overviewColumns}
      minimal={true}
      header={
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-text-primary text-lg font-semibold">{t('title')}</h2>
          <Link href="/expenses" className="text-blue flex items-center gap-1 text-sm font-medium hover:underline">
            {t('viewAll')}
            <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
          </Link>
        </div>
      }
      emptyState={
        // No CTA — the Spending Trend empty state next to it already offers one
        <EmptyState
          icon={Receipt}
          title={tOnboarding('recentExpenses.title')}
          description={tOnboarding('recentExpenses.description')}
        />
      }
    />
  );
};

export default RecentExpenses;
