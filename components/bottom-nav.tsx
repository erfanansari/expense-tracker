'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Wallet
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard, color: 'violet' },
  { href: '/transactions', label: 'Transactions', icon: FileText, color: 'cyan' },
  { href: '/reports', label: 'Reports', icon: BarChart3, color: 'amber' },
  { href: '/assets', label: 'Assets', icon: Wallet, color: 'emerald' },
];

const colorClasses: Record<string, { text: string; bg: string; glow: string }> = {
  violet: { text: 'text-violet-400', bg: 'bg-violet-500/15', glow: 'from-violet-500 to-purple-500' },
  cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/15', glow: 'from-cyan-500 to-blue-500' },
  amber: { text: 'text-amber-400', bg: 'bg-amber-500/15', glow: 'from-amber-500 to-orange-500' },
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/15', glow: 'from-emerald-500 to-green-500' },
};

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a12]/95 backdrop-blur-xl border-t border-[#1f1f30] z-50 safe-area-pb">
      <div className="flex items-center justify-around h-18 px-2 pb-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const colors = colorClasses[item.color];

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-1 flex-1 h-full py-2 transition-all duration-200 ${
                isActive ? colors.text : 'text-zinc-500'
              }`}
            >
              {isActive && (
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-gradient-to-r ${colors.glow} rounded-b-full shadow-lg`} />
              )}
              <div className={`p-2.5 rounded-xl transition-all duration-200 ${
                isActive ? `${colors.bg} shadow-lg` : 'hover:bg-zinc-800/50'
              }`}>
                <Icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
              </div>
              <span className={`text-[10px] font-semibold tracking-wide ${isActive ? colors.text : 'text-zinc-500'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
