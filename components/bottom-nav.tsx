'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Wallet
} from 'lucide-react';
import { MobileUserMenu } from './user-menu';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: FileText },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/assets', label: 'Assets', icon: Wallet },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-[#e5e5e5] z-50 safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-1 flex-1 h-full py-2 transition-all duration-200 ${
                isActive ? 'text-[#0070f3]' : 'text-[#a3a3a3]'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-[#0070f3] rounded-b" />
              )}
              <Icon className={`h-5 w-5 transition-all duration-200 ${isActive ? 'scale-110' : ''}`} />
              <span className={`text-[10px] font-semibold tracking-wide ${isActive ? 'text-[#0070f3]' : 'text-[#a3a3a3]'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* User Account Menu */}
        <MobileUserMenu />
      </div>
    </nav>
  );
}
