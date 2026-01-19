'use client';

import { useCallback, useEffect, useState } from 'react';

import { Banknote, DollarSign, Edit, FileText, Loader2, Plus, Trash2, TrendingUp } from 'lucide-react';

import type { Income } from '@types';

import IncomeForm from '@features/income/components/IncomeForm';

import Button from '@components/Button';
import DeleteConfirmModal from '@components/DeleteConfirmModal';
import FormDrawer from '@components/FormDrawer';
import useDrawer from '@components/FormDrawer/useDrawer';
import Loading from '@components/Loading';

import { getIncomeTypeLabel, getMonthLabel } from '@/constants/income';
import { formatNumber, getJalaliMonthName } from '@/utils';

export default function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingIncome, setEditingIncome] = useState<Income | undefined>(undefined);
  const [incomeToDelete, setIncomeToDelete] = useState<Income | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { isOpen: isDrawerOpen, isDirty, openDrawer, closeDrawer, setIsDirty } = useDrawer();

  const fetchIncomes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/incomes');
      if (response.ok) {
        const data = await response.json();
        setIncomes(data);
      } else {
        setError('Failed to load incomes');
      }
    } catch {
      setError('Failed to load incomes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openDeleteModal = (income: Income) => {
    setIncomeToDelete(income);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIncomeToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!incomeToDelete) return;

    setDeletingId(incomeToDelete.id);

    try {
      const response = await fetch(`/api/incomes/${incomeToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setIncomes(incomes.filter((inc) => inc.id !== incomeToDelete.id));
        closeDeleteModal();
      } else {
        alert('Failed to delete income');
      }
    } catch {
      alert('Failed to delete income');
    } finally {
      setDeletingId(null);
    }
  };

  const handleIncomeChange = useCallback(() => {
    fetchIncomes();
    setEditingIncome(undefined);
    closeDrawer();
  }, [fetchIncomes, closeDrawer]);

  const handleEdit = useCallback(
    (income: Income) => {
      setEditingIncome(income);
      openDrawer();
    },
    [openDrawer]
  );

  const handleAddIncome = useCallback(() => {
    setEditingIncome(undefined);
    openDrawer();
  }, [openDrawer]);

  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  // Calculate summary stats
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const ytdIncome = incomes.filter((inc) => inc.year === currentYear).reduce((sum, inc) => sum + inc.amountUsd, 0);

  const currentMonthIncome = incomes
    .filter((inc) => inc.year === currentYear && inc.month === currentMonth)
    .reduce((sum, inc) => sum + inc.amountUsd, 0);

  const totalIncomeAllTime = incomes.reduce((sum, inc) => sum + inc.amountUsd, 0);
  const totalIncomeAllTimeToman = incomes.reduce((sum, inc) => sum + inc.amountToman, 0);

  const avgMonthlyIncome = incomes.length > 0 ? totalIncomeAllTime / incomes.length : 0;

  // Group incomes by year
  const incomesByYear = incomes.reduce(
    (acc, income) => {
      if (!acc[income.year]) {
        acc[income.year] = [];
      }
      acc[income.year].push(income);
      return acc;
    },
    {} as Record<number, Income[]>
  );

  const sortedYears = Object.keys(incomesByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-[1600px] px-6 py-8">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between gap-4 sm:mb-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-text-primary text-xl font-bold sm:text-2xl md:text-3xl">Income</h1>
            <p className="text-text-muted mt-1 text-xs sm:text-sm">Track your monthly earnings</p>
          </div>
          <Button variant="primary" onClick={handleAddIncome} className="shrink-0">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Income</span>
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {/* Total Income (All Time) */}
          <div className="border-border-subtle bg-background relative min-w-0 rounded-xl border p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="border-success/20 bg-success-light rounded-lg border p-2.5">
                <Banknote className="text-success h-5 w-5" />
              </div>
            </div>
            <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">Total Income</p>
            <p className="text-success text-2xl font-semibold tabular-nums">${formatNumber(totalIncomeAllTime)}</p>
            <p className="text-text-secondary mt-1.5 text-sm font-medium" dir="rtl">
              {formatNumber(totalIncomeAllTimeToman)} تومان
            </p>
          </div>

          {/* YTD Income */}
          <div className="border-border-subtle bg-background relative min-w-0 rounded-xl border p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
                <TrendingUp className="text-blue h-5 w-5" />
              </div>
            </div>
            <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">YTD Income</p>
            <p className="text-text-primary text-2xl font-semibold tabular-nums">${formatNumber(ytdIncome)}</p>
            <p className="text-text-secondary mt-1.5 text-sm font-medium">{currentYear}</p>
          </div>

          {/* Current Month */}
          <div className="border-border-subtle bg-background relative min-w-0 rounded-xl border p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
                <DollarSign className="text-text-secondary h-5 w-5" />
              </div>
            </div>
            <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">This Month</p>
            <p className="text-text-primary text-2xl font-semibold tabular-nums">${formatNumber(currentMonthIncome)}</p>
            <p className="text-text-secondary mt-1.5 text-sm font-medium">
              {getMonthLabel(currentMonth).en} - <span dir="rtl">{getJalaliMonthName(currentMonth, currentYear)}</span>
            </p>
          </div>

          {/* Average Monthly */}
          <div className="border-border-subtle bg-background relative min-w-0 rounded-xl border p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
                <TrendingUp className="text-text-secondary h-5 w-5" />
              </div>
            </div>
            <p className="text-text-muted mb-2 text-xs font-medium tracking-wider uppercase">Avg Monthly</p>
            <p className="text-text-primary text-2xl font-semibold tabular-nums">
              ${formatNumber(Math.round(avgMonthlyIncome))}
            </p>
            <p className="text-text-secondary mt-1.5 text-sm font-medium">per entry</p>
          </div>
        </div>

        {/* Income List */}
        {(() => {
          if (isLoading && incomes.length === 0) {
            return <Loading message="Loading income..." />;
          }
          if (error && incomes.length === 0) {
            return (
              <div className="border-border-subtle bg-background relative rounded-xl border p-16 text-center shadow-sm">
                <div className="border-danger bg-danger-light mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl border">
                  <FileText className="text-danger h-8 w-8" />
                </div>
                <p className="text-danger font-medium">{error}</p>
              </div>
            );
          }
          if (incomes.length === 0) {
            return (
              <div className="border-border-subtle bg-background relative rounded-xl border p-16 text-center shadow-sm">
                <div className="border-border-subtle bg-background-secondary mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl border">
                  <DollarSign className="text-text-muted h-8 w-8" />
                </div>
                <p className="text-text-secondary font-medium">No income recorded yet</p>
                <p className="text-text-muted mt-1 text-sm">Add your first income entry above!</p>
              </div>
            );
          }
          return (
            <div className="space-y-6">
              {sortedYears.map((year) => (
                <div key={year}>
                  <h2 className="text-text-primary mb-4 text-lg font-semibold">{year}</h2>
                  <div className="border-border-subtle bg-background relative overflow-hidden rounded-xl border shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px] border-collapse">
                        <thead>
                          <tr className="bg-background-secondary">
                            <th className="text-text-muted min-w-[100px] px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase sm:px-6 sm:py-4">
                              Month
                            </th>
                            <th className="text-text-muted min-w-[100px] px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase sm:px-6 sm:py-4">
                              Type
                            </th>
                            <th className="text-text-muted min-w-[120px] px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase sm:px-6 sm:py-4">
                              Source
                            </th>
                            <th className="text-text-muted min-w-[130px] px-4 py-3 text-right text-xs font-semibold tracking-wider uppercase sm:px-6 sm:py-4">
                              Amount
                            </th>
                            <th className="text-text-muted min-w-[80px] px-4 py-3 text-center text-xs font-semibold tracking-wider uppercase sm:px-6 sm:py-4">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {incomesByYear[year]
                            .sort((a, b) => b.month - a.month)
                            .map((income) => {
                              const typeLabels = getIncomeTypeLabel(income.incomeType);
                              const monthLabels = getMonthLabel(income.month);
                              const jalaliMonth = getJalaliMonthName(income.month, income.year);

                              return (
                                <tr
                                  key={income.id}
                                  className="group border-border-subtle hover:bg-background-elevated border-t transition-colors duration-200 first:border-t-0"
                                >
                                  <td className="px-4 py-3 sm:px-6 sm:py-4">
                                    <div className="flex flex-col">
                                      <span className="text-text-primary text-sm font-medium">{monthLabels.en}</span>
                                      <span className="text-text-muted text-xs" dir="rtl">
                                        {jalaliMonth}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 sm:px-6 sm:py-4">
                                    <div className="flex flex-col">
                                      <span className="text-text-primary text-sm font-medium">{typeLabels.en}</span>
                                      <span className="text-text-muted text-xs" dir="rtl">
                                        {typeLabels.fa}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 sm:px-6 sm:py-4">
                                    <span className="text-text-secondary text-sm">{income.source || '-'}</span>
                                  </td>
                                  <td className="px-4 py-3 text-right sm:px-6 sm:py-4">
                                    <div className="flex flex-col items-end">
                                      <span className="text-success text-sm font-semibold">
                                        ${formatNumber(income.amountUsd)} USD
                                      </span>
                                      <span className="text-text-muted text-xs" dir="rtl">
                                        {formatNumber(income.amountToman)} تومان
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 sm:px-6 sm:py-4">
                                    <div className="flex items-center justify-center gap-1">
                                      <button
                                        onClick={() => handleEdit(income)}
                                        className="text-text-muted hover:bg-blue/10 hover:text-blue rounded-lg p-2 transition-all duration-200"
                                        title="Edit"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => openDeleteModal(income)}
                                        disabled={deletingId === income.id}
                                        className="text-text-muted hover:bg-danger/10 hover:text-danger rounded-lg p-2 transition-all duration-200 disabled:opacity-50"
                                        title="Delete"
                                      >
                                        {deletingId === income.id ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Trash2 className="h-4 w-4" />
                                        )}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          title="Delete income"
          message="Are you sure you want to delete this income entry?"
          itemName={
            incomeToDelete
              ? `${getMonthLabel(incomeToDelete.month).en} (${getJalaliMonthName(incomeToDelete.month, incomeToDelete.year)}) ${incomeToDelete.year} - ${getIncomeTypeLabel(incomeToDelete.incomeType).en}`
              : undefined
          }
          onConfirm={confirmDelete}
          onCancel={closeDeleteModal}
          isDeleting={deletingId === incomeToDelete?.id}
        />
      </div>

      {/* Income Form Drawer */}
      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        title={editingIncome ? 'Edit Income' : 'Add New Income'}
        titleFa={editingIncome ? 'ویرایش درآمد' : 'افزودن درآمد جدید'}
        isDirty={isDirty}
      >
        <IncomeForm
          onIncomeAdded={handleIncomeChange}
          editingIncome={editingIncome}
          onCancelEdit={closeDrawer}
          setIsDirty={setIsDirty}
        />
      </FormDrawer>
    </div>
  );
}
