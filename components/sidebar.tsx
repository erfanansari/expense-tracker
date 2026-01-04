'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Wallet,
  Settings,
  Zap,
  ChevronRight,
  LogOut,
  Bell
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  color: string;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'violet' },
  { href: '/transactions', label: 'Transactions', icon: FileText, color: 'cyan' },
  { href: '/reports', label: 'Reports', icon: BarChart3, color: 'amber' },
  { href: '/assets', label: 'Assets', icon: Wallet, color: 'emerald' },
];

const colorVariants: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  violet: {
    bg: 'from-violet-500/20 to-purple-600/20',
    border: 'border-violet-500/30',
    text: 'text-violet-400',
    glow: 'shadow-violet-500/20'
  },
  cyan: {
    bg: 'from-cyan-500/20 to-blue-600/20',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
    glow: 'shadow-cyan-500/20'
  },
  amber: {
    bg: 'from-amber-500/20 to-orange-600/20',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/20'
  },
  emerald: {
    bg: 'from-emerald-500/20 to-green-600/20',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    glow: 'shadow-emerald-500/20'
  },
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-gradient-to-b from-[#0a0a12] to-[#05050a] border-r border-[#1f1f30] h-screen sticky top-0 max-h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-[#1f1f30]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-xl blur-lg opacity-50" />
            <div className="relative p-2.5 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-xl shadow-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Kharji</span>
            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Finance Tracker</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
        <p className="text-[10px] text-zinc-600 font-semibold uppercase tracking-widest px-3 mb-3">Main Menu</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const colors = colorVariants[item.color];

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? `bg-gradient-to-r ${colors.bg} ${colors.border} border shadow-lg ${colors.glow}`
                  : 'text-zinc-400 hover:bg-[#0f0f18] hover:text-white border border-transparent hover:border-[#1f1f30]'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-violet-500 to-cyan-500 rounded-r-full" />
              )}
              <div className={`p-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? `bg-gradient-to-br ${colors.bg} ${colors.border} border`
                  : 'bg-[#0a0a12] group-hover:bg-[#141420] border border-[#1f1f30]'
              }`}>
                <Icon className={`h-4 w-4 transition-colors ${isActive ? colors.text : 'text-zinc-500 group-hover:text-zinc-300'}`} />
              </div>
              <span className={`font-medium text-sm ${isActive ? 'text-white' : ''}`}>{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg shadow-rose-500/30">
                  {item.badge}
                </span>
              )}
              <ChevronRight className={`ml-auto h-4 w-4 transition-all duration-200 ${
                isActive ? 'text-zinc-400 opacity-100' : 'opacity-0 group-hover:opacity-100 text-zinc-600 group-hover:translate-x-0.5'
              }`} />
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 space-y-2 border-t border-[#1f1f30]">
        <Link
          href="/notifications"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:bg-[#0f0f18] hover:text-white transition-all duration-200 border border-transparent hover:border-[#1f1f30] group"
        >
          <div className="relative">
            <Bell className="h-5 w-5" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
          </div>
          <span className="font-medium text-sm">Notifications</span>
          <span className="ml-auto bg-rose-500/20 text-rose-400 text-xs font-bold px-2 py-0.5 rounded-full border border-rose-500/30">
            3
          </span>
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:bg-[#0f0f18] hover:text-white transition-all duration-200 border border-transparent hover:border-[#1f1f30] group"
        >
          <Settings className="h-5 w-5" />
          <span className="font-medium text-sm">Settings</span>
        </Link>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-[#1f1f30]">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#0f0f18] to-[#0a0a12] border border-[#1f1f30] hover:border-[#2a2a40] transition-all duration-200 cursor-pointer group">
          <div className="relative">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-violet-500/30">
              U
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0a0a12]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">User</p>
            <p className="text-xs text-zinc-500 truncate">Pro Account</p>
          </div>
          <LogOut className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
        </div>
      </div>
    </aside>
  );
}

