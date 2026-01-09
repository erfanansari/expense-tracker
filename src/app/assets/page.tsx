'use client';

import { Building2, Coins, CreditCard, PiggyBank, Plus, Sparkles, TrendingUp, Wallet } from 'lucide-react';

import Button from '@components/Button';
import DashboardLayout from '@components/DashboardLayout';

export default function AssetsPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#ffffff]">
        <div className="mx-auto max-w-[1600px] px-6 py-8">
          {/* Page Header */}
          <div className="mb-6 flex items-center justify-between gap-4 sm:mb-8">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-[#171717] sm:text-2xl md:text-3xl">Assets</h1>
              <p className="mt-1 text-xs text-[#a3a3a3] sm:text-sm">Manage your wealth portfolio</p>
            </div>
            <Button variant="primary" className="shrink-0">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Asset</span>
            </Button>
          </div>

          {/* Quick Stats Preview */}
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: 'Total Value', value: '$0.00', icon: TrendingUp, iconColor: '#0070f3' },
              { label: 'Savings', value: '$0.00', icon: PiggyBank, iconColor: '#10b981' },
              { label: 'Investments', value: '$0.00', icon: Coins, iconColor: '#525252' },
              { label: 'Properties', value: '$0.00', icon: Building2, iconColor: '#0070f3' },
            ].map((stat, i) => (
              <div
                key={i}
                className="relative rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <div className="mb-3 w-fit rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-2">
                  <stat.icon className="h-4 w-4" style={{ color: stat.iconColor }} />
                </div>
                <p className="text-xs font-medium tracking-wide text-[#a3a3a3] uppercase">{stat.label}</p>
                <p className="mt-1 text-xl font-bold text-[#171717]">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Empty State */}
          <div className="relative rounded-xl border border-[#e5e5e5] bg-white p-16 shadow-sm">
            <div className="relative mx-auto max-w-lg text-center">
              <div className="relative mb-6 inline-flex">
                <div className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-6">
                  <Wallet className="h-12 w-12 text-[#525252]" />
                </div>
              </div>

              <h2 className="mb-3 text-2xl font-bold text-[#171717]">Start tracking your assets</h2>
              <p className="mb-8 leading-relaxed text-[#525252]">
                Get a complete picture of your financial situation by adding your bank accounts, investments,
                properties, and more.
              </p>

              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button variant="primary" className="w-full sm:w-auto">
                  <Plus className="h-5 w-5" />
                  Add Your First Asset
                </Button>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Sparkles className="h-5 w-5" />
                  Import from Bank
                </Button>
              </div>

              {/* Asset Types Preview */}
              <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { icon: CreditCard, label: 'Bank Accounts', iconColor: '#0070f3' },
                  { icon: Coins, label: 'Investments', iconColor: '#525252' },
                  { icon: Building2, label: 'Real Estate', iconColor: '#10b981' },
                  { icon: PiggyBank, label: 'Savings', iconColor: '#0070f3' },
                ].map((type, i) => (
                  <div
                    key={i}
                    className="group cursor-pointer rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-4 transition-all duration-200 hover:border-[#d4d4d4]"
                  >
                    <type.icon
                      className="mx-auto mb-2 h-6 w-6 opacity-60 transition-opacity group-hover:opacity-100"
                      style={{ color: type.iconColor }}
                    />
                    <p className="text-xs text-[#a3a3a3] transition-colors group-hover:text-[#525252]">{type.label}</p>
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
