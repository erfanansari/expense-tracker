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
      <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0f0f18] border border-[#1f1f30] animate-pulse">
        <div className="w-10 h-10 rounded-full bg-[#1f1f30]" />
        <div className="flex-1">
          <div className="h-3 w-24 bg-[#1f1f30] rounded mb-2" />
          <div className="h-2 w-16 bg-[#1f1f30] rounded" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <a
        href="/login"
        className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#0f0f18] hover:bg-[#141420] border border-[#1f1f30] transition-all duration-200"
      >
        <div className="p-2 rounded-full bg-[#1f1f30]">
          <User className="h-5 w-5 text-zinc-500" />
        </div>
        <span className="text-sm font-medium text-zinc-400">Sign in</span>
      </a>
    );
  }

  const initials = user.email.charAt(0).toUpperCase();

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#0f0f18] hover:bg-[#141420] border border-[#1f1f30] transition-all duration-200 group"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-full blur opacity-50" />
          <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
            {initials}
          </div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0f0f18]" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium text-white truncate">{user.email}</p>
          <p className="text-xs text-zinc-500">Active</p>
        </div>
        <ChevronUp className={`h-4 w-4 text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#0f0f18] border border-[#1f1f30] rounded-xl shadow-xl shadow-black/50 overflow-hidden z-50">
          <div className="p-2">
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Sign out</span>
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
        className="relative flex flex-col items-center justify-center gap-1 flex-1 h-full py-2 transition-all duration-200 text-zinc-500"
      >
        <div className="p-2.5 rounded-xl hover:bg-zinc-800/50">
          <User className="h-5 w-5" />
        </div>
        <span className="text-[10px] font-semibold tracking-wide">Sign in</span>
      </a>
    );
  }

  const initials = user.email.charAt(0).toUpperCase();

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex flex-col items-center justify-center gap-1 flex-1 h-full py-2 transition-all duration-200 text-zinc-500"
      >
        <div className={`p-2.5 rounded-xl transition-all duration-200 ${
          isOpen ? 'bg-violet-500/15 shadow-lg' : 'hover:bg-zinc-800/50'
        }`}>
          <User className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'scale-110 text-violet-400' : ''}`} />
        </div>
        <span className={`text-[10px] font-semibold tracking-wide ${isOpen ? 'text-violet-400' : 'text-zinc-500'}`}>
          Account
        </span>
      </button>

      {/* Mobile dropdown - appears above the button */}
      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 bg-[#0f0f18] border border-[#1f1f30] rounded-xl shadow-xl shadow-black/50 overflow-hidden z-50">
          {/* User info */}
          <div className="p-4 border-b border-[#1f1f30]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                  {initials}
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0f0f18]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.email}</p>
                <p className="text-xs text-zinc-500">Active</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-2">
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
