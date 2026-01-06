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
      <div className="relative bg-white rounded-xl border border-[#e5e5e5] p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200">

        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 bg-[#fafafa] rounded-lg border border-[#e5e5e5]">
            <TrendingUp className="h-5 w-5 text-[#0070f3]" />
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-[#10b981] bg-[#ecfdf5] px-2 py-1 rounded-md border border-[#10b981]/20">
            <ArrowUpRight className="h-3 w-3" />
            <span>12.5%</span>
          </div>
        </div>

        <div>
          <p className="text-xs text-[#a3a3a3] font-medium uppercase tracking-wider mb-2">Total Expenses</p>
          <p className="text-2xl sm:text-3xl font-bold text-[#171717] tabular-nums" dir="rtl">
            {formatNumber(totalToman)} <span className="text-lg text-[#a3a3a3]">تومان</span>
          </p>
          <p className="text-sm text-[#525252] mt-1.5 font-medium">
            ${totalUsd.toFixed(2)} USD
          </p>
        </div>
      </div>

      {/* Number of Transactions */}
      <div className="relative bg-white rounded-xl border border-[#e5e5e5] p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200">

        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 bg-[#fafafa] rounded-lg border border-[#e5e5e5]">
            <Hash className="h-5 w-5 text-[#10b981]" />
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-[#0070f3] bg-[#0070f3]/10 px-2 py-1 rounded-md border border-[#0070f3]/20">
            <Sparkles className="h-3 w-3" />
            <span>Active</span>
          </div>
        </div>

        <div>
          <p className="text-xs text-[#a3a3a3] font-medium uppercase tracking-wider mb-2">Transactions</p>
          <p className="text-2xl sm:text-3xl font-bold text-[#171717] tabular-nums">
            {expenses.length}
          </p>
          <p className="text-sm text-[#525252] mt-1.5 font-medium" dir="rtl">
            تعداد تراکنش
          </p>
        </div>
      </div>

      {/* Average Daily Spending */}
      <div className="relative bg-white rounded-xl border border-[#e5e5e5] p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200">

        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 bg-[#fafafa] rounded-lg border border-[#e5e5e5]">
            <BarChart3 className="h-5 w-5 text-[#525252]" />
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-[#ef4444] bg-[#fef2f2] px-2 py-1 rounded-md border border-[#ef4444]/20">
            <ArrowDownRight className="h-3 w-3" />
            <span>3.2%</span>
          </div>
        </div>

        <div>
          <p className="text-xs text-[#a3a3a3] font-medium uppercase tracking-wider mb-2">Daily Average</p>
          <p className="text-2xl sm:text-3xl font-bold text-[#171717] tabular-nums" dir="rtl">
            {formatNumber(avgDailyToman)} <span className="text-lg text-[#a3a3a3]">تومان</span>
          </p>
          <p className="text-sm text-[#525252] mt-1.5 font-medium">
            ${avgDailyUsd.toFixed(2)} USD
          </p>
        </div>
      </div>
    </div>
  );
}
