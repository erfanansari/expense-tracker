'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Wallet,
  Settings,
  Zap,
  Bell,
  User,
  LogOut,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: FileText },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/assets', label: 'Assets', icon: Wallet },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
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
    <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-[#e5e5e5] h-screen sticky top-0 max-h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-[#e5e5e5]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#000000] rounded-lg">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-semibold text-[#171717]">Kharji</span>
            <p className="text-[10px] text-[#a3a3a3] font-medium uppercase tracking-wider">Finance Tracker</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <p className="text-[10px] text-[#a3a3a3] font-semibold uppercase tracking-widest px-3 mb-3">Main Menu</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-[#fafafa] text-[#171717]'
                  : 'text-[#525252] hover:bg-[#f5f5f5] hover:text-[#171717]'
              }`}
            >
              <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-[#171717]' : 'text-[#a3a3a3]'}`} />
              <span className={`font-medium text-sm ${isActive ? 'text-[#171717]' : ''}`}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 space-y-1 border-t border-[#e5e5e5]">
        <Link
          href="/notifications"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#525252] hover:bg-[#f5f5f5] hover:text-[#171717] transition-all duration-200 group"
        >
          <div className="relative">
            <Bell className="h-5 w-5" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#ef4444] rounded-full" />
          </div>
          <span className="font-medium text-sm">Notifications</span>
          <span className="ml-auto bg-[#fef2f2] text-[#ef4444] text-xs font-semibold px-2 py-0.5 rounded-md border border-[#e5e5e5]">
            3
          </span>
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#525252] hover:bg-[#f5f5f5] hover:text-[#171717] transition-all duration-200 group"
        >
          <Settings className="h-5 w-5" />
          <span className="font-medium text-sm">Settings</span>
        </Link>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-[#e5e5e5] relative" ref={menuRef}>
        {/* Dropdown Menu */}
        {isUserMenuOpen && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-[#e5e5e5] rounded-lg shadow-lg overflow-hidden z-50">
            <div className="p-3 border-b border-[#e5e5e5]">
              <p className="text-sm font-semibold text-[#171717]">erfanansari</p>
              <p className="text-xs text-[#a3a3a3] truncate">dev.erfanansari@gmail.com</p>
            </div>
            <div className="py-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#525252] hover:bg-[#f5f5f5] hover:text-[#171717] transition-colors"
                onClick={() => setIsUserMenuOpen(false)}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#525252] hover:bg-[#f5f5f5] hover:text-[#171717] transition-colors"
                onClick={() => setIsUserMenuOpen(false)}
              >
                <Settings className="h-4 w-4" />
                Account Settings
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

        {/* User Button */}
        <button
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#fafafa] border border-[#e5e5e5] hover:bg-[#f5f5f5] transition-all duration-200 group"
        >
          <div className="relative">
            <div className="h-10 w-10 rounded-lg bg-[#000000] flex items-center justify-center text-white font-semibold text-sm">
              E
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#10b981] rounded-full border-2 border-white" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-[#171717] truncate">erfanansari</p>
            <p className="text-xs text-[#a3a3a3] truncate">dev.erfanansari@gmail.com</p>
          </div>
          <ChevronUp className={`h-4 w-4 text-[#a3a3a3] transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </aside>
  );
}
