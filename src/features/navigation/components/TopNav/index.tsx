'use client';

import { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ChevronDown, CommandIcon, LayoutDashboard, LogOut, Settings, Zap } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

import { ROUTES } from '@constants';

import { useCommandPalette } from '@/components/CommandPalette/CommandPaletteProvider';
import { useAuth } from '@/features/auth/hooks/use-auth';

import type { NavItem } from './@types';

const navItems: NavItem[] = [
  { href: '/overview', label: 'Overview' },
  { href: '/transactions', label: 'Transactions' },
  { href: '/income', label: 'Income' },
  { href: '/reports', label: 'Reports' },
  { href: '/assets', label: 'Assets' },
  { href: '/settings', label: 'Settings' },
];

const TopNav: FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { toggle: toggleCommandPalette } = useCommandPalette();
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
    <header className="border-border-subtle bg-background sticky top-0 z-50 border-b">
      <div className="mx-auto max-w-[1600px]">
        {/* Top row - Logo and actions */}
        <div className="flex items-center justify-between px-6 py-3">
          {/* Logo */}
          <Link href={ROUTES.OVERVIEW} className="flex items-center gap-2.5">
            <div className="bg-button-primary-bg rounded-md p-2">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-text-primary text-base font-semibold">Kharji</span>
          </Link>

          {/* Right side - user menu */}
          <div className="flex items-center gap-3">
            {/* User Menu */}
            <div ref={menuRef} className="relative z-50">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="border-border-subtle hover:bg-background-elevated flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors"
              >
                <div className="relative">
                  <div className="bg-button-primary-bg flex h-7 w-7 items-center justify-center rounded-lg text-xs font-semibold text-white">
                    {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="bg-success absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-white" />
                </div>
                <ChevronDown
                  className={twMerge(
                    'text-text-muted h-4 w-4 transition-transform duration-200',
                    isUserMenuOpen && 'rotate-180'
                  )}
                />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="border-border-subtle bg-background absolute top-full right-0 mt-2 w-56 overflow-hidden rounded-lg border shadow-lg">
                  <div className="border-border-subtle border-b p-3">
                    <p className="text-text-primary text-sm font-semibold">
                      {user?.name || user?.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-text-muted truncate text-xs">{user?.email || ''}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/overview"
                      className="text-text-secondary hover:bg-background-elevated hover:text-text-primary flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Overview
                    </Link>
                    <Link
                      href="/settings"
                      className="text-text-secondary hover:bg-background-elevated hover:text-text-primary flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        toggleCommandPalette();
                      }}
                      className="text-text-secondary hover:bg-background-elevated hover:text-text-primary flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <CommandIcon className="h-4 w-4" />
                        Command Menu
                      </div>
                      <kbd className="border-border-subtle text-text-muted rounded border px-1.5 py-0.5 font-mono text-xs">
                        ⌘ K
                      </kbd>
                    </button>
                  </div>
                  <div className="border-border-subtle border-t">
                    <button
                      className="text-text-secondary hover:bg-background-elevated hover:text-text-primary flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors"
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
                  isActive ? 'text-text-primary' : 'text-text-muted hover:text-text-primary'
                )}
              >
                {item.label}
                {isActive && <div className="bg-primary absolute right-0 bottom-0 left-0 h-0.5" />}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default TopNav;
