'use client';

import { useCallback, useEffect, useState } from 'react';

import { Banknote, DollarSign, Edit, FileText, Loader2, Plus, Trash2, TrendingUp, X } from 'lucide-react';

import type { Income } from '@types';

import IncomeForm from '@features/income/components/IncomeForm';

import Button from '@components/Button';
import Loading from '@components/Loading';

import { getIncomeTypeLabel, getMonthLabel } from '@/constants/income';
import { formatNumber } from '@/utils';

export default function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingIncome, setEditingIncome] = useState<Income | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);

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

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this income entry?')) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(`/api/incomes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setIncomes(incomes.filter((inc) => inc.id !== id));
      } else {
        alert('Failed to delete income');
      }
    } catch {
      alert('Failed to delete income');
    } finally {
      setDeletingId(null);
    }
  };

  const handleIncomeChange = () => {
    fetchIncomes();
    setEditingIncome(undefined);
    setShowForm(false);
  };

  const handleEdit = (income: Income) => {
    setEditingIncome(income);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingIncome(undefined);
    setShowForm(false);
  };

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
    <div className="min-h-screen bg-[#ffffff]">
      <div className="mx-auto max-w-[1600px] px-6 py-8">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between gap-4 sm:mb-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-[#171717] sm:text-2xl md:text-3xl">Income</h1>
            <p className="mt-1 text-xs text-[#a3a3a3] sm:text-sm">Track your monthly earnings</p>
          </div>
          {showForm ? (
            <Button variant="outline" onClick={handleCancelEdit} className="shrink-0">
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Cancel</span>
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => {
                setShowForm(true);
                setEditingIncome(undefined);
              }}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Income</span>
            </Button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {/* Total Income (All Time) */}
          <div className="relative min-w-0 rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-lg border border-[#10b981]/20 bg-[#ecfdf5] p-2.5">
                <Banknote className="h-5 w-5 text-[#10b981]" />
              </div>
            </div>
            <p className="mb-2 text-xs font-medium tracking-wider text-[#a3a3a3] uppercase">Total Income</p>
            <p className="text-2xl font-semibold text-[#10b981] tabular-nums">${formatNumber(totalIncomeAllTime)}</p>
            <p className="mt-1.5 text-sm font-medium text-[#525252]" dir="rtl">
              {formatNumber(totalIncomeAllTimeToman)} تومان
            </p>
          </div>

          {/* YTD Income */}
          <div className="relative min-w-0 rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-2.5">
                <TrendingUp className="h-5 w-5 text-[#0070f3]" />
              </div>
            </div>
            <p className="mb-2 text-xs font-medium tracking-wider text-[#a3a3a3] uppercase">YTD Income</p>
            <p className="text-2xl font-semibold text-[#171717] tabular-nums">${formatNumber(ytdIncome)}</p>
            <p className="mt-1.5 text-sm font-medium text-[#525252]">{currentYear}</p>
          </div>

          {/* Current Month */}
          <div className="relative min-w-0 rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-2.5">
                <DollarSign className="h-5 w-5 text-[#525252]" />
              </div>
            </div>
            <p className="mb-2 text-xs font-medium tracking-wider text-[#a3a3a3] uppercase">This Month</p>
            <p className="text-2xl font-semibold text-[#171717] tabular-nums">${formatNumber(currentMonthIncome)}</p>
            <p className="mt-1.5 text-sm font-medium text-[#525252]">{getMonthLabel(currentMonth).en}</p>
          </div>

          {/* Average Monthly */}
          <div className="relative min-w-0 rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-2.5">
                <TrendingUp className="h-5 w-5 text-[#525252]" />
              </div>
            </div>
            <p className="mb-2 text-xs font-medium tracking-wider text-[#a3a3a3] uppercase">Avg Monthly</p>
            <p className="text-2xl font-semibold text-[#171717] tabular-nums">
              ${formatNumber(Math.round(avgMonthlyIncome))}
            </p>
            <p className="mt-1.5 text-sm font-medium text-[#525252]">per entry</p>
          </div>
        </div>

        {/* Income Form */}
        {showForm && (
          <div className="animate-in slide-in-from-top-4 mb-6 duration-300">
            <IncomeForm
              onIncomeAdded={handleIncomeChange}
              editingIncome={editingIncome}
              onCancelEdit={handleCancelEdit}
            />
          </div>
        )}

        {/* Income List */}
        {(() => {
          if (isLoading && incomes.length === 0) {
            return <Loading message="Loading income..." />;
          }
          if (error && incomes.length === 0) {
            return (
              <div className="relative rounded-xl border border-[#e5e5e5] bg-white p-16 text-center shadow-sm">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl border border-[#ef4444] bg-[#fef2f2]">
                  <FileText className="h-8 w-8 text-[#ef4444]" />
                </div>
                <p className="font-medium text-[#ef4444]">{error}</p>
              </div>
            );
          }
          if (incomes.length === 0) {
            return (
              <div className="relative rounded-xl border border-[#e5e5e5] bg-white p-16 text-center shadow-sm">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl border border-[#e5e5e5] bg-[#fafafa]">
                  <DollarSign className="h-8 w-8 text-[#a3a3a3]" />
                </div>
                <p className="font-medium text-[#525252]">No income recorded yet</p>
                <p className="mt-1 text-sm text-[#a3a3a3]">Add your first income entry above!</p>
              </div>
            );
          }
          return (
            <div className="space-y-6">
              {sortedYears.map((year) => (
                <div key={year}>
                  <h2 className="mb-4 text-lg font-semibold text-[#171717]">{year}</h2>
                  <div className="relative overflow-hidden rounded-xl border border-[#e5e5e5] bg-white shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full table-fixed border-collapse">
                        <thead>
                          <tr className="bg-[#fafafa]">
                            <th className="w-[20%] px-6 py-4 text-left text-xs font-semibold tracking-wider text-[#a3a3a3] uppercase">
                              Month
                            </th>
                            <th className="w-[20%] px-6 py-4 text-left text-xs font-semibold tracking-wider text-[#a3a3a3] uppercase">
                              Type
                            </th>
                            <th className="w-[25%] px-6 py-4 text-left text-xs font-semibold tracking-wider text-[#a3a3a3] uppercase">
                              Source
                            </th>
                            <th className="w-[22%] px-6 py-4 text-right text-xs font-semibold tracking-wider text-[#a3a3a3] uppercase">
                              Amount
                            </th>
                            <th className="w-[13%] px-6 py-4 text-center text-xs font-semibold tracking-wider text-[#a3a3a3] uppercase">
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

                              return (
                                <tr
                                  key={income.id}
                                  className="group border-t border-[#e5e5e5] transition-colors duration-200 first:border-t-0 hover:bg-[#f5f5f5]"
                                >
                                  <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                      <span className="text-sm font-medium text-[#171717]">{monthLabels.en}</span>
                                      <span className="text-xs text-[#a3a3a3]" dir="rtl">
                                        {monthLabels.fa}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                      <span className="text-sm font-medium text-[#171717]">{typeLabels.en}</span>
                                      <span className="text-xs text-[#a3a3a3]" dir="rtl">
                                        {typeLabels.fa}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="text-sm text-[#525252]">{income.source || '-'}</span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex flex-col items-end">
                                      <span className="text-sm font-semibold text-[#10b981]">
                                        ${formatNumber(income.amountUsd)} USD
                                      </span>
                                      <span className="text-xs text-[#a3a3a3]" dir="rtl">
                                        {formatNumber(income.amountToman)} تومان
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-1">
                                      <button
                                        onClick={() => handleEdit(income)}
                                        className="rounded-lg p-2 text-[#a3a3a3] transition-all duration-200 hover:bg-[#0070f3]/10 hover:text-[#0070f3]"
                                        title="Edit"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDelete(income.id)}
                                        disabled={deletingId === income.id}
                                        className="rounded-lg p-2 text-[#a3a3a3] transition-all duration-200 hover:bg-[#ef4444]/10 hover:text-[#ef4444] disabled:opacity-50"
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
      </div>
    </div>
  );
}
