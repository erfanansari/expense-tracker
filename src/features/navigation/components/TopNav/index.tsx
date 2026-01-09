'use client';

import { useState, useRef, useEffect } from 'react';
import type { FC } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, ChevronDown, LogOut, Settings, LayoutDashboard } from 'lucide-react';

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
    <header className="border-b border-[#e5e5e5] bg-white sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto">
        {/* Top row - Logo and actions */}
        <div className="flex items-center justify-between px-6 py-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#000000] rounded-md">
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
                className="flex items-center gap-2 p-2 hover:bg-[#f5f5f5] rounded-lg transition-colors"
              >
                <div className="relative">
                  <div className="h-7 w-7 rounded-lg bg-[#000000] flex items-center justify-center text-white font-semibold text-xs">
                    E
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#10b981] rounded-full border-2 border-white" />
                </div>
                <ChevronDown className={`h-4 w-4 text-[#a3a3a3] transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-[#e5e5e5] rounded-lg shadow-lg overflow-hidden">
                  <div className="p-3 border-b border-[#e5e5e5]">
                    <p className="text-sm font-semibold text-[#171717]">erfanansari</p>
                    <p className="text-xs text-[#a3a3a3] truncate">dev.erfanansari@gmail.com</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/overview"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#525252] hover:bg-[#f5f5f5] hover:text-[#171717] transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Overview
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#525252] hover:bg-[#f5f5f5] hover:text-[#171717] transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </div>
                  <div className="border-t border-[#e5e5e5]">
                    <button
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#525252] hover:bg-[#f5f5f5] hover:text-[#171717] transition-colors"
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
        <nav className="flex items-center gap-1 px-6 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-[#171717]'
                    : 'text-[#a3a3a3] hover:text-[#171717]'
                }`}
              >
                {item.label}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#171717]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default TopNav;
