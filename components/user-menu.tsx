'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { LogOut, ChevronUp, User } from 'lucide-react';

export function UserMenu() {
  const { user, logout, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-[#fafafa] border border-[#e5e5e5] animate-pulse">
        <div className="w-10 h-10 rounded-lg bg-[#e5e5e5]" />
        <div className="flex-1">
          <div className="h-3 w-24 bg-[#e5e5e5] rounded mb-2" />
          <div className="h-2 w-16 bg-[#e5e5e5] rounded" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <a
        href="/login"
        className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#fafafa] hover:bg-[#f5f5f5] border border-[#e5e5e5] transition-all duration-200"
      >
        <div className="p-2 rounded-lg bg-[#e5e5e5]">
          <User className="h-5 w-5 text-[#525252]" />
        </div>
        <span className="text-sm font-medium text-[#525252]">Sign in</span>
      </a>
    );
  }

  const initials = user.email.charAt(0).toUpperCase();

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#fafafa] border border-[#e5e5e5] hover:bg-[#f5f5f5] transition-all duration-200 group"
      >
        <div className="relative">
          <div className="h-10 w-10 rounded-lg bg-[#000000] flex items-center justify-center text-white font-semibold text-sm">
            {initials}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#10b981] rounded-full border-2 border-white" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-semibold text-[#171717] truncate">{user.email.split('@')[0]}</p>
          <p className="text-xs text-[#a3a3a3] truncate">{user.email}</p>
        </div>
        <ChevronUp className={`h-4 w-4 text-[#a3a3a3] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-[#e5e5e5] rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-3 border-b border-[#e5e5e5]">
            <p className="text-sm font-semibold text-[#171717]">{user.email.split('@')[0]}</p>
            <p className="text-xs text-[#a3a3a3] truncate">{user.email}</p>
          </div>
          <div className="p-1">
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#525252] hover:bg-[#f5f5f5] hover:text-[#171717] rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for mobile
export function MobileUserMenu() {
  const { user, logout, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <a
        href="/login"
        className="relative flex flex-col items-center justify-center gap-1 flex-1 h-full py-2 transition-all duration-200 text-[#a3a3a3]"
      >
        <User className="h-5 w-5" />
        <span className="text-[10px] font-semibold tracking-wide">Account</span>
      </a>
    );
  }

  const initials = user.email.charAt(0).toUpperCase();

  return (
    <div ref={menuRef} className="relative flex-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex flex-col items-center justify-center gap-1 w-full h-full py-2 transition-all duration-200 ${
          isOpen ? 'text-[#0070f3]' : 'text-[#a3a3a3]'
        }`}
      >
        {isOpen && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-[#0070f3] rounded-b" />
        )}
        <User className={`h-5 w-5 transition-all duration-200 ${isOpen ? 'scale-110' : ''}`} />
        <span className={`text-[10px] font-semibold tracking-wide ${isOpen ? 'text-[#0070f3]' : 'text-[#a3a3a3]'}`}>
          Account
        </span>
      </button>

      {/* Mobile dropdown - appears above the button */}
      {isOpen && (
        <div className="fixed bottom-20 left-4 right-4 bg-white border border-[#e5e5e5] rounded-lg shadow-lg overflow-hidden z-50">
          {/* User info */}
          <div className="p-3 border-b border-[#e5e5e5]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-[#000000] flex items-center justify-center text-white font-semibold text-sm">
                  E
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#10b981] rounded-full border-2 border-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#171717] truncate">erfanansari</p>
                <p className="text-xs text-[#a3a3a3] truncate">dev.erfanansari@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-1">
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#525252] hover:bg-[#f5f5f5] hover:text-[#171717] transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
