'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { Wallet, Plus, Sparkles, TrendingUp, PiggyBank, CreditCard, Building2, Coins } from 'lucide-react';

export default function AssetsPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#ffffff]">
        <div className="max-w-[1600px] mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#171717]">Assets</h1>
              <p className="text-xs sm:text-sm text-[#a3a3a3] mt-1">Manage your wealth portfolio</p>
            </div>
            <button className="px-3 sm:px-5 py-2.5 bg-[#000000] hover:bg-[#171717] rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 shadow-sm text-white flex-shrink-0">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Asset</span>
            </button>
          </div>

          {/* Quick Stats Preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Value', value: '$0.00', icon: TrendingUp, iconColor: '#0070f3' },
              { label: 'Savings', value: '$0.00', icon: PiggyBank, iconColor: '#10b981' },
              { label: 'Investments', value: '$0.00', icon: Coins, iconColor: '#525252' },
              { label: 'Properties', value: '$0.00', icon: Building2, iconColor: '#0070f3' },
            ].map((stat, i) => (
              <div
                key={i}
                className="relative bg-white rounded-xl p-5 border border-[#e5e5e5] shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="p-2 bg-[#fafafa] rounded-lg border border-[#e5e5e5] w-fit mb-3">
                  <stat.icon className="h-4 w-4" style={{ color: stat.iconColor }} />
                </div>
                <p className="text-xs text-[#a3a3a3] font-medium uppercase tracking-wide">{stat.label}</p>
                <p className="text-xl font-bold text-[#171717] mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Empty State */}
          <div className="relative bg-white rounded-xl p-16 border border-[#e5e5e5] shadow-sm">

            <div className="max-w-lg mx-auto text-center relative">
              <div className="relative inline-flex mb-6">
                <div className="p-6 bg-[#fafafa] rounded-2xl border border-[#e5e5e5]">
                  <Wallet className="h-12 w-12 text-[#525252]" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-[#171717] mb-3">
                Start tracking your assets
              </h2>
              <p className="text-[#525252] mb-8 leading-relaxed">
                Get a complete picture of your financial situation by adding your bank accounts, investments, properties, and more.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button className="w-full sm:w-auto px-6 py-3 bg-[#000000] hover:bg-[#171717] rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm text-white">
                  <Plus className="h-5 w-5" />
                  Add Your First Asset
                </button>
                <button className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-[#f5f5f5] border border-[#e5e5e5] rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 group">
                  <Sparkles className="h-5 w-5 text-[#a3a3a3] group-hover:text-[#171717] transition-colors" />
                  <span className="text-[#525252] group-hover:text-[#171717] transition-colors">Import from Bank</span>
                </button>
              </div>

              {/* Asset Types Preview */}
              <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: CreditCard, label: 'Bank Accounts', iconColor: '#0070f3' },
                  { icon: Coins, label: 'Investments', iconColor: '#525252' },
                  { icon: Building2, label: 'Real Estate', iconColor: '#10b981' },
                  { icon: PiggyBank, label: 'Savings', iconColor: '#0070f3' },
                ].map((type, i) => (
                  <div
                    key={i}
                    className="p-4 bg-[#fafafa] rounded-lg border border-[#e5e5e5] hover:border-[#d4d4d4] transition-all duration-200 cursor-pointer group"
                  >
                    <type.icon className="h-6 w-6 mx-auto mb-2 transition-opacity opacity-60 group-hover:opacity-100" style={{ color: type.iconColor }} />
                    <p className="text-xs text-[#a3a3a3] group-hover:text-[#525252] transition-colors">{type.label}</p>
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



