'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { Wallet, Plus, Sparkles, TrendingUp, PiggyBank, CreditCard, Building2, Coins } from 'lucide-react';

export default function AssetsPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#05050a] text-white relative">
        {/* Background effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[100px]" />
        </div>

        {/* Header */}
        <div className="border-b border-[#1f1f30] bg-[#0a0a12]/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-green-600/20 rounded-xl border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                  <Wallet className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Assets</h1>
                  <p className="text-sm text-zinc-500 mt-0.5">Manage your wealth portfolio</p>
                </div>
              </div>
              <button className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]">
                <Plus className="h-4 w-4" />
                Add Asset
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          {/* Quick Stats Preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Value', value: '$0.00', icon: TrendingUp, color: 'violet' },
              { label: 'Savings', value: '$0.00', icon: PiggyBank, color: 'emerald' },
              { label: 'Investments', value: '$0.00', icon: Coins, color: 'amber' },
              { label: 'Properties', value: '$0.00', icon: Building2, color: 'cyan' },
            ].map((stat, i) => (
              <div
                key={i}
                className={`relative bg-gradient-to-br from-[#0f0f18] to-[#0a0a12] rounded-2xl p-5 border border-[#1f1f30] overflow-hidden group hover:border-${stat.color}-500/30 transition-all duration-300`}
              >
                <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-${stat.color}-500/40 to-transparent`} />
                <div className={`p-2 bg-gradient-to-br from-${stat.color}-500/20 to-${stat.color}-600/10 rounded-lg border border-${stat.color}-500/20 w-fit mb-3`}>
                  <stat.icon className={`h-4 w-4 text-${stat.color}-400`} />
                </div>
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">{stat.label}</p>
                <p className="text-xl font-bold text-white mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Empty State */}
          <div className="relative bg-gradient-to-br from-[#0a0a12] to-[#05050a] rounded-2xl p-16 border border-[#1f1f30] overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-violet-500/10 rounded-full blur-[100px]" />

            <div className="max-w-lg mx-auto text-center relative">
              <div className="relative inline-flex mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 to-violet-500/30 rounded-3xl blur-2xl" />
                <div className="relative p-6 bg-gradient-to-br from-[#0f0f18] to-[#141420] rounded-3xl border border-[#2a2a40] shadow-2xl">
                  <Wallet className="h-12 w-12 text-emerald-400" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-3">
                Start tracking your assets
              </h2>
              <p className="text-zinc-400 mb-8 leading-relaxed">
                Get a complete picture of your financial situation by adding your bank accounts, investments, properties, and more.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]">
                  <Plus className="h-5 w-5" />
                  Add Your First Asset
                </button>
                <button className="w-full sm:w-auto px-6 py-3 bg-[#0f0f18] hover:bg-[#1a1a28] border border-[#2a2a40] hover:border-[#3a3a55] rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 group">
                  <Sparkles className="h-5 w-5 text-zinc-400 group-hover:text-violet-400 transition-colors" />
                  <span className="text-zinc-300 group-hover:text-white transition-colors">Import from Bank</span>
                </button>
              </div>

              {/* Asset Types Preview */}
              <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: CreditCard, label: 'Bank Accounts', color: 'blue' },
                  { icon: Coins, label: 'Investments', color: 'amber' },
                  { icon: Building2, label: 'Real Estate', color: 'emerald' },
                  { icon: PiggyBank, label: 'Savings', color: 'violet' },
                ].map((type, i) => (
                  <div
                    key={i}
                    className="p-4 bg-[#0a0a12]/50 rounded-xl border border-[#1f1f30] hover:border-[#2a2a40] transition-all duration-200 cursor-pointer group"
                  >
                    <type.icon className={`h-6 w-6 text-${type.color}-400/60 group-hover:text-${type.color}-400 transition-colors mx-auto mb-2`} />
                    <p className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">{type.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

