'use client';

import { useLocale, useTranslations } from 'next-intl';

import { deleteIncomeKeyGenerator } from '@api/deleteIncomeMutation';
import type { DeleteIncomeRequestData } from '@api/deleteIncomeMutation';
import { getIncomeListKeyGenerator, INCOMES_SCOPE } from '@api/getIncomeListQuery';
import type { GetIncomeListResponse } from '@api/getIncomeListQuery';
import { SUMMARY_SCOPE } from '@api/getSummaryQuery';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

import type { Income } from '@types';

import Button from '@components/Button';
import DeleteConfirmModal from '@components/DeleteConfirmModal';
import PageHeader from '@components/PageHeader';
import Pulse from '@components/Skeleton';

import { useIncomeTypeLabel } from '@hooks/use-constant-labels';
import { useDeleteConfirmation } from '@hooks/use-delete-confirmation';
import { useLocalePreferences } from '@hooks/use-locale-preferences';
import { useMonthYearDisplay } from '@hooks/use-month-year-display';

import { useDrawerStore } from '@stores/drawer';
import { useToast } from '@stores/toast';

import { ensureError, getDisplayYear, resolveCalendar } from '@utils';
import type { AppLocale } from '@utils';

import IncomeSummary from './components/IncomeSummary';
import IncomeTable from './components/IncomeTable';

function IncomeSummarySkeleton() {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="border-border-subtle bg-background rounded-xl border p-4 shadow-sm sm:p-5">
          <Pulse className="mb-3 h-9 w-9 rounded-lg sm:mb-4 sm:h-10 sm:w-10" />
          <Pulse className="mb-2 h-3 w-20 sm:mb-3 sm:w-24" />
          <Pulse className="mb-2 h-6 w-3/4 sm:h-8" />
          <Pulse className="h-3 w-1/2 sm:h-4" />
        </div>
      ))}
    </div>
  );
}

const IncomePage = () => {
  // Customs
  const t = useTranslations('pages.income');
  const locale = useLocale() as AppLocale;
  const monthYearDisplay = useMonthYearDisplay();
  const incomeTypeLabel = useIncomeTypeLabel();
  const { prefs: localePrefs } = useLocalePreferences();
  const calendar = resolveCalendar(localePrefs.calendar, locale);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Queries
  const {
    data: incomes = [],
    isLoading,
    error,
    refetch,
  } = useQuery<GetIncomeListResponse>({ queryKey: getIncomeListKeyGenerator() });

  // Mutations
  const { mutateAsync: deleteIncomeAsync } = useMutation<void, Error, DeleteIncomeRequestData>({
    mutationKey: deleteIncomeKeyGenerator(),
  });

  const openIncomeDrawer = useDrawerStore((state) => state.openIncomeDrawer);
  const {
    itemToDelete: incomeToDelete,
    isModalOpen: isDeleteModalOpen,
    deletingId,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
    confirmDelete,
  } = useDeleteConfirmation<Income>({
    onDelete: async (id) => {
      await deleteIncomeAsync({ id });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: INCOMES_SCOPE }),
        queryClient.invalidateQueries({ queryKey: SUMMARY_SCOPE }),
      ]);
      showToast(t('deleted'), 'info');
    },
    onError: (err) => showToast(ensureError(err).message, 'error'),
  });

  // Variables
  let deleteItemName: string | undefined;
  if (incomeToDelete) {
    const { primary, secondary } = monthYearDisplay(incomeToDelete.month, incomeToDelete.year);
    const type = incomeTypeLabel(incomeToDelete.incomeType);
    deleteItemName = secondary
      ? t('deleteItemNameWithJalali', { month: primary, jalaliMonth: secondary, type })
      : t('deleteItemName', { month: primary, type });
  }

  // Grouped by the resolved calendar's year so each group header is internally
  // consistent — a Gregorian year can straddle two Jalali years (around Nowruz),
  // so grouping must follow the same calendar as the displayed month, not the
  // raw stored (Gregorian) year.
  const incomesByYear = incomes.reduce(
    (acc, income) => {
      const displayYear = getDisplayYear(income.month, income.year, calendar);
      if (!acc[displayYear]) {
        acc[displayYear] = [];
      }
      acc[displayYear].push(income);
      return acc;
    },
    {} as Record<number, Income[]>
  );

  const sortedYears = Object.keys(incomesByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1600px] px-6 py-8">
        <PageHeader
          title={t('title')}
          subtitle={t('subtitle')}
          action={
            <>
              <Button variant="primary" onClick={() => openIncomeDrawer()}>
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">{t('addIncome')}</span>
              </Button>
            </>
          }
        />

        {/* On a failed fetch with no cached data, the table below shows the error —
            don't render a summary of zeros that reads as an empty account. */}
        {isLoading && incomes.length === 0 ? (
          <IncomeSummarySkeleton />
        ) : (
          !(error && incomes.length === 0) && <IncomeSummary incomes={incomes} />
        )}

        <IncomeTable
          incomesByYear={incomesByYear}
          sortedYears={sortedYears}
          isLoading={isLoading && incomes.length === 0}
          error={error}
          onEdit={openIncomeDrawer}
          onDelete={openDeleteModal}
          deletingId={deletingId}
          onRetry={() => refetch()}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          title={t('deleteTitle')}
          message={t('deleteMessage')}
          itemName={deleteItemName}
          onConfirm={confirmDelete}
          onCancel={closeDeleteModal}
          isDeleting={deletingId === incomeToDelete?.id}
        />
      </div>
    </div>
  );
};

export default IncomePage;
