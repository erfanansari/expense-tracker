'use client';

import { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ChevronDown, LayoutDashboard, LogOut, Settings, Zap } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

import { useAuth } from '@/features/auth/hooks/use-auth';

import type { NavItem } from './@types';

const navItems: NavItem[] = [
  { href: '/overview', label: 'Overview' },
  { href: '/transactions', label: 'Transactions' },
  { href: '/reports', label: 'Reports' },
  { href: '/assets', label: 'Assets' },
  { href: '/settings', label: 'Settings' },
];

const TopNav: FC = () => {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-[#e5e5e5] bg-white">
      <div className="mx-auto max-w-[1600px]">
        {/* Top row - Logo and actions */}
        <div className="flex items-center justify-between px-6 py-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="rounded-md bg-[#000000] p-2">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-semibold text-[#171717]">Kharji</span>
          </div>

          {/* Right side - user menu */}
          <div className="flex items-center gap-3">
            {/* User Menu */}
            <div ref={menuRef} className="relative z-50">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 rounded-lg border border-[#e5e5e5] px-3 py-2 transition-colors hover:bg-[#f5f5f5]"
              >
                <div className="relative">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#000000] text-xs font-semibold text-white">
                    E
                  </div>
                  <div className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#10b981]" />
                </div>
                <ChevronDown
                  className={twMerge(
                    'h-4 w-4 text-[#a3a3a3] transition-transform duration-200',
                    isUserMenuOpen && 'rotate-180'
                  )}
                />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 overflow-hidden rounded-lg border border-[#e5e5e5] bg-white shadow-lg">
                  <div className="border-b border-[#e5e5e5] p-3">
                    <p className="text-sm font-semibold text-[#171717]">erfanansari</p>
                    <p className="truncate text-xs text-[#a3a3a3]">dev.erfanansari@gmail.com</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/overview"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#525252] transition-colors hover:bg-[#f5f5f5] hover:text-[#171717]"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Overview
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#525252] transition-colors hover:bg-[#f5f5f5] hover:text-[#171717]"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </div>
                  <div className="border-t border-[#e5e5e5]">
                    <button
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#525252] transition-colors hover:bg-[#f5f5f5] hover:text-[#171717]"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs - scrollable on mobile */}
        <nav className="scrollbar-hide flex items-center gap-1 overflow-x-auto px-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={twMerge(
                  'relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors',
                  isActive ? 'text-[#171717]' : 'text-[#a3a3a3] hover:text-[#171717]'
                )}
              >
                {item.label}
                {isActive && <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-[#171717]" />}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default TopNav;
