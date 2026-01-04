'use client';

import { TrendingUp, Hash, BarChart3, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';
import { type Expense } from '@/lib/types/expense';
import { formatNumber } from '@/lib/utils';

interface ExpenseStatsProps {
  expenses: Expense[];
}

export function ExpenseStats({ expenses }: ExpenseStatsProps) {
  const totalToman = expenses.reduce((sum, exp) => sum + exp.price_toman, 0);
  const totalUsd = expenses.reduce((sum, exp) => sum + exp.price_usd, 0);

  // Calculate average daily spending from first expense to today (including zero-spending days)
  let avgDailyToman = 0;
  let avgDailyUsd = 0;

  if (expenses.length > 0) {
    const dates = expenses.map(exp => new Date(exp.date).getTime());
    const firstDate = new Date(Math.min(...dates));
    const today = new Date();

    // Reset today to start of day for accurate day count
    today.setHours(0, 0, 0, 0);
    firstDate.setHours(0, 0, 0, 0);

    // Calculate total days from first expense to today (inclusive)
    const totalDays = Math.ceil((today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    avgDailyToman = totalDays > 0 ? totalToman / totalDays : 0;
    avgDailyUsd = totalDays > 0 ? totalUsd / totalDays : 0;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
      {/* Total Expenses */}
      <div className="relative bg-gradient-to-br from-[#0f0f18] to-[#0a0a12] rounded-2xl border border-[#1f1f30] p-5 sm:p-6 overflow-hidden group hover:border-cyan-500/30 transition-all duration-300">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
            <TrendingUp className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
            <ArrowUpRight className="h-3 w-3" />
            <span>12.5%</span>
          </div>
        </div>

        <div>
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-2">Total Expenses</p>
          <p className="text-2xl sm:text-3xl font-bold text-white tabular-nums" dir="rtl">
            {formatNumber(totalToman)} <span className="text-lg text-zinc-500">تومان</span>
          </p>
          <p className="text-sm text-zinc-400 mt-1.5 font-medium">
            ${totalUsd.toFixed(2)} USD
          </p>
        </div>
      </div>

      {/* Number of Transactions */}
      <div className="relative bg-gradient-to-br from-[#0f0f18] to-[#0a0a12] rounded-2xl border border-[#1f1f30] p-5 sm:p-6 overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-green-600/20 rounded-xl border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
            <Hash className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-lg border border-cyan-500/20">
            <Sparkles className="h-3 w-3" />
            <span>Active</span>
          </div>
        </div>

        <div>
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-2">Transactions</p>
          <p className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
            {expenses.length}
          </p>
          <p className="text-sm text-zinc-400 mt-1.5 font-medium" dir="rtl">
            تعداد تراکنش
          </p>
        </div>
      </div>

      {/* Average Daily Spending */}
      <div className="relative bg-gradient-to-br from-[#0f0f18] to-[#0a0a12] rounded-2xl border border-[#1f1f30] p-5 sm:p-6 overflow-hidden group hover:border-violet-500/30 transition-all duration-300">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 bg-gradient-to-br from-violet-500/20 to-purple-600/20 rounded-xl border border-violet-500/30 shadow-lg shadow-violet-500/10">
            <BarChart3 className="h-5 w-5 text-violet-400" />
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-rose-400 bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-500/20">
            <ArrowDownRight className="h-3 w-3" />
            <span>3.2%</span>
          </div>
        </div>

        <div>
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-2">Daily Average</p>
          <p className="text-2xl sm:text-3xl font-bold text-white tabular-nums" dir="rtl">
            {formatNumber(avgDailyToman)} <span className="text-lg text-zinc-500">تومان</span>
          </p>
          <p className="text-sm text-zinc-400 mt-1.5 font-medium">
            ${avgDailyUsd.toFixed(2)} USD
          </p>
        </div>
      </div>
    </div>
  );
}
