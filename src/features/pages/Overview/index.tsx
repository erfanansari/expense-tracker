'use client';

import Link from 'next/link';

import { Plus } from 'lucide-react';

import type { Expense } from '@types';

import { getButtonClasses } from '@components/Button';
import Pulse from '@components/Skeleton';

import { useAllExpenses } from '@hooks/use-all-expenses';
import { useSummary } from '@hooks/use-summary';

import ExchangeRateCard from './components/ExchangeRateCard';
import OverviewStats from './components/OverviewStats';
import RecentTransactions from './components/RecentTransactions';
import SpendingTrendChart from './components/SpendingTrendChart';

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
      <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:gap-6 lg:grid-cols-3">
        <div className="border-border-subtle bg-background rounded-xl border p-4 shadow-sm sm:p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between sm:mb-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <Pulse className="h-9 w-9 sm:h-10 sm:w-10" />
              <Pulse className="h-4 w-28 sm:h-5 sm:w-36" />
            </div>
            <Pulse className="h-8 w-24 sm:h-9 sm:w-32" />
          </div>
          <Pulse className="h-[220px] w-full sm:h-[300px]" />
        </div>
        <div className="border-border-subtle bg-background rounded-xl border p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-2 sm:mb-5 sm:gap-3">
            <Pulse className="h-9 w-9 sm:h-10 sm:w-10" />
            <div>
              <Pulse className="mb-1 h-4 w-24 sm:h-5 sm:w-28" />
              <Pulse className="h-3 w-16 sm:w-20" />
            </div>
          </div>
          <div className="flex h-[180px] items-center justify-center sm:h-[220px]">
            <div className="relative flex h-36 w-36 items-center justify-center sm:h-44 sm:w-44">
              <Pulse className="absolute h-36 w-36 rounded-full sm:h-44 sm:w-44" />
              <div className="bg-background relative z-10 h-[94px] w-[94px] rounded-full sm:h-[118px] sm:w-[118px]" />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4">
            {[...Array(4)].map((_, i) => (
              <Pulse key={i} className="h-9 sm:h-[42px]" />
            ))}
          </div>
        </div>
      </div>

      {/* Table skeleton */}
      <div className="border-border-subtle bg-background overflow-hidden rounded-xl border shadow-sm">
        <div className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
          <Pulse className="h-5 w-36 sm:w-44" />
          <Pulse className="h-5 w-14 sm:w-16" />
        </div>
        <div className="bg-background-secondary px-4 py-3 sm:px-6 sm:py-3.5">
          <div className="flex items-center justify-between">
            <Pulse className="h-3 w-20 sm:w-24" />
            <Pulse className="hidden h-3 w-20 sm:block" />
            <Pulse className="hidden h-3 w-16 sm:block" />
            <Pulse className="h-3 w-16 sm:w-20" />
          </div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-border-subtle border-t px-4 py-3.5 sm:px-6 sm:py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Pulse className="h-4 w-32 sm:w-36" />
                <Pulse className="h-3 w-20" />
              </div>
              <div className="hidden flex-col gap-1 sm:flex">
                <Pulse className="h-4 w-20" />
                <Pulse className="h-3 w-16" />
              </div>
              <div className="hidden flex-col gap-1 sm:flex">
                <Pulse className="h-4 w-24" />
                <Pulse className="h-3 w-14" />
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Pulse className="h-4 w-20 sm:w-28" />
                <Pulse className="h-3 w-14 sm:w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

const Dashboard = () => {
  // Queries
  const { data: summary, isLoading: summaryLoading } = useSummary();
  const { data: expensesData, isLoading: expensesLoading } = useAllExpenses();

  // Variables
  const expenses: Expense[] = expensesData ?? [];
  const isLoading = summaryLoading || expensesLoading;

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="mx-auto max-w-[1600px] p-8 px-6">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-text-primary text-xl font-bold sm:text-2xl md:text-3xl">Overview</h1>
            <p className="text-text-muted mt-1 text-xs sm:text-sm">
              Welcome back! Here&apos;s your financial overview.
            </p>
          </div>
          <Link href="/transactions" className={getButtonClasses('primary', 'shrink-0')}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Transaction</span>
          </Link>
        </div>

        {isLoading ? (
          <OverviewSkeleton />
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
              <RecentTransactions expenses={expenses} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
