'use client';

import Link from 'next/link';

import { getAllExpensesKeyGenerator } from '@api/getAllExpensesQuery';
import type { GetAllExpensesResponse } from '@api/getAllExpensesQuery';
import { getSummaryKeyGenerator } from '@api/getSummaryQuery';
import type { SummaryData } from '@api/getSummaryQuery';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

import type { Expense } from '@types';

import { ApiError } from '@core/errors';

import { getButtonClasses } from '@components/Button';
import ErrorState from '@components/ErrorState';
import Pulse from '@components/Skeleton';

import ExchangeRateCard from './components/ExchangeRateCard';
import OverviewStats from './components/OverviewStats';
import RecentExpenses from './components/RecentExpenses';
import SpendingTrendChart from './components/SpendingTrendChart';

const SKELETON_BAR_HEIGHTS = [
  'h-[28%]',
  'h-[22%]',
  'h-[35%]',
  'h-[48%]',
  'h-[65%]',
  'h-[80%]',
  'h-[92%]',
  'h-[70%]',
  'h-[50%]',
  'h-[38%]',
  'h-[55%]',
  'h-[72%]',
  'h-[60%]',
  'h-[42%]',
  'h-[30%]',
  'h-[45%]',
  'h-[62%]',
  'h-[78%]',
  'h-[55%]',
  'h-[38%]',
  'h-[28%]',
  'h-[35%]',
  'h-[48%]',
  'h-[40%]',
  'h-[32%]',
];

function OverviewSkeleton() {
  return (
    <>
      {/* 4 card skeletons */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border-border-subtle bg-background rounded-xl border p-4 shadow-sm sm:p-6">
            <Pulse className="mb-3 h-9 w-9 sm:mb-4 sm:h-10 sm:w-10" />
            <Pulse className="mb-2 h-3 w-20 sm:mb-3 sm:w-24" />
            <Pulse className="mb-2 h-6 w-3/4 sm:h-8" />
            <Pulse className="h-3 w-1/3 sm:h-4" />
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3">
        {/* Spending trend chart skeleton */}
        <div className="border-border-subtle bg-background relative rounded-xl border p-5 shadow-sm sm:p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between sm:mb-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <Pulse className="h-9 w-9 sm:h-10 sm:w-10" />
              <Pulse className="h-4 w-28 sm:h-5 sm:w-36" />
            </div>
            <Pulse className="h-8 w-24 sm:h-9 sm:w-32" />
          </div>
          <div className="flex h-[450px] gap-3 sm:gap-4">
            <div className="flex w-8 flex-col justify-between py-2 sm:w-10">
              <Pulse className="h-3 w-full" />
              <Pulse className="h-3 w-full" />
              <Pulse className="h-3 w-full" />
              <Pulse className="h-3 w-full" />
              <Pulse className="h-3 w-full" />
            </div>
            <div className="flex flex-1 flex-col gap-3">
              <div className="flex flex-1 items-end gap-1 sm:gap-1.5">
                {SKELETON_BAR_HEIGHTS.map((h, i) => (
                  <Pulse key={i} className={`flex-1 rounded-md ${h}`} />
                ))}
              </div>
              <div className="flex justify-between">
                <Pulse className="h-3 w-10" />
                <Pulse className="h-3 w-10" />
                <Pulse className="h-3 w-10" />
                <Pulse className="h-3 w-10" />
                <Pulse className="h-3 w-10" />
                <Pulse className="h-3 w-10" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent expenses skeleton */}
        <div className="border-border-subtle bg-background overflow-hidden rounded-xl border shadow-sm">
          <div className="flex items-center justify-between px-6 py-5">
            <Pulse className="h-5 w-40" />
            <Pulse className="h-4 w-14" />
          </div>
          <div className="bg-background-secondary px-6 py-3">
            <div className="flex items-center justify-between">
              <Pulse className="h-3 w-20" />
              <Pulse className="h-3 w-14" />
            </div>
          </div>
          {[...Array(7)].map((_, i) => (
            <div key={i} className="border-border-subtle border-t px-6 py-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Pulse className="h-4 w-32" />
                  {i % 3 === 0 && <Pulse className="h-5 w-16 rounded-md" />}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Pulse className="h-4 w-24" />
                  <Pulse className="h-3 w-14" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

const Dashboard = () => {
  // Queries
  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useQuery<SummaryData>({ queryKey: getSummaryKeyGenerator() });
  const {
    data: expensesData,
    isLoading: expensesLoading,
    error: expensesError,
    refetch: refetchExpenses,
  } = useQuery<GetAllExpensesResponse>({
    queryKey: getAllExpensesKeyGenerator(),
  });

  // Variables
  const expenses: Expense[] = expensesData ?? [];
  const isLoading = summaryLoading || expensesLoading;
  // Never dress a failed fetch up as an empty account — show the error honestly.
  // 401 means the auth redirect is already in flight; don't flash an error banner.
  const rawError = summaryError ?? expensesError;
  const error = rawError instanceof ApiError && rawError.status === 401 ? null : rawError;

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="mx-auto max-w-[1600px] p-8 px-6">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-text-primary text-xl font-semibold sm:text-2xl md:text-3xl">Overview</h1>
            <p className="text-text-muted mt-1 text-xs sm:text-sm">
              Welcome back! Here&apos;s your financial overview.
            </p>
          </div>
          <Link href="/expenses" className={getButtonClasses('primary', 'shrink-0')}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Expense</span>
          </Link>
        </div>

        {isLoading && <OverviewSkeleton />}
        {!isLoading &&
          (error ? (
            <div className="border-border-subtle bg-background rounded-xl border shadow-sm">
              <ErrorState
                title="Couldn't load your overview"
                description={error.message}
                onRetry={() => {
                  void refetchSummary();
                  void refetchExpenses();
                }}
              />
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
                <OverviewStats summary={summary} />
                <ExchangeRateCard />
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3">
                <SpendingTrendChart expenses={expenses} />
                <RecentExpenses expenses={expenses} />
              </div>
            </>
          ))}
      </div>
    </div>
  );
};

export default Dashboard;
