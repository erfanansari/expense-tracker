'use client';

import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import {
  type Action,
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarResults,
  KBarSearch,
  useKBar,
  useMatches,
  VisualState,
} from 'kbar';
import { DollarSign, LayoutDashboard, PieChart, Receipt, Search, Settings, TrendingUp } from 'lucide-react';

interface CommandPaletteContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextType | undefined>(undefined);

export const useCommandPalette = () => {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    throw new Error('useCommandPalette must be used within CommandPaletteProvider');
  }
  return context;
};

// Inner component that uses kbar hooks
function CommandPaletteInner({ children }: { children: ReactNode }) {
  const { query, visualState } = useKBar((state) => ({
    visualState: state.visualState,
  }));

  const contextValue = useMemo<CommandPaletteContextType>(
    () => ({
      isOpen: visualState !== VisualState.hidden,
      open: () => visualState === VisualState.hidden && query.toggle(),
      close: () => visualState !== VisualState.hidden && query.toggle(),
      toggle: () => query.toggle(),
    }),
    [visualState, query]
  );

  return (
    <CommandPaletteContext.Provider value={contextValue}>
      {children}
      <CommandPaletteUI />
    </CommandPaletteContext.Provider>
  );
}

// Custom UI component using kbar primitives
function CommandPaletteUI() {
  return (
    <KBarPortal>
      <KBarPositioner className="fixed inset-0 z-(--z-command-palette) flex items-center justify-center bg-black/30 px-4 backdrop-blur-[2px]">
        <KBarAnimator className="border-border-subtle bg-background w-full max-w-2xl overflow-hidden rounded-xl border shadow-2xl">
          {/* Search input */}
          <div className="border-border-subtle flex items-center gap-3 border-b px-4 py-3">
            <Search className="text-text-muted h-5 w-5" />
            <KBarSearch
              className="text-text-primary placeholder:text-text-muted flex-1 bg-transparent text-sm outline-none"
              placeholder="Type a command or search..."
            />
            <kbd className="bg-background-elevated text-text-muted hidden rounded px-2 py-1 text-xs sm:inline-block">
              ESC
            </kbd>
          </div>

          {/* Results list */}
          <RenderResults />

          {/* Footer hints */}
          <div className="border-border-subtle text-text-muted flex items-center justify-center gap-4 border-t px-4 py-2.5 text-xs">
            <span className="flex items-center gap-1">
              <kbd className="bg-background-elevated rounded px-1.5 py-0.5">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-background-elevated rounded px-1.5 py-0.5">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-background-elevated rounded px-1.5 py-0.5">ESC</kbd>
              Close
            </span>
          </div>
        </KBarAnimator>
      </KBarPositioner>
    </KBarPortal>
  );
}

// Results renderer
function RenderResults() {
  const { results } = useMatches();

  return (
    <div className="max-h-96 overflow-y-auto overscroll-contain py-2">
      {results.length === 0 ? (
        <div className="text-text-muted px-4 py-8 text-center text-sm">No commands found</div>
      ) : (
        <KBarResults
          items={results}
          onRender={({ item, active }) =>
            typeof item === 'string' ? (
              // Section header (e.g., "Actions", "Navigation")
              <div className="text-text-tertiary px-4 py-2 text-xs font-semibold uppercase">{item}</div>
            ) : (
              // Command item
              <div
                className={`flex w-full items-center justify-between border-l-2 px-4 py-2.5 text-left transition-all duration-150 ${
                  active
                    ? 'border-blue bg-background-elevated text-text-primary'
                    : 'text-text-secondary hover:bg-background-hover border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon && <span className="text-text-muted">{item.icon}</span>}
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                {item.shortcut && item.shortcut.length > 0 && (
                  <kbd className="bg-background-secondary text-text-muted hidden rounded px-2 py-1 text-xs sm:inline-block">
                    {item.shortcut.join(' ')}
                  </kbd>
                )}
              </div>
            )
          }
        />
      )}
    </div>
  );
}

// Main provider component
export const CommandPaletteProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();

  // Build static navigation actions
  const staticActions = useMemo<Action[]>(() => {
    const allActions = [
      { id: 'nav-overview', name: 'Go to Overview', path: '/overview', icon: <LayoutDashboard className="h-4 w-4" /> },
      {
        id: 'nav-transactions',
        name: 'Go to Transactions',
        path: '/transactions',
        icon: <Receipt className="h-4 w-4" />,
      },
      { id: 'nav-income', name: 'Go to Income', path: '/income', icon: <DollarSign className="h-4 w-4" /> },
      { id: 'nav-assets', name: 'Go to Assets', path: '/assets', icon: <TrendingUp className="h-4 w-4" /> },
      { id: 'nav-reports', name: 'Go to Reports', path: '/reports', icon: <PieChart className="h-4 w-4" /> },
      { id: 'nav-settings', name: 'Go to Settings', path: '/settings', icon: <Settings className="h-4 w-4" /> },
    ];

    return allActions
      .filter((action) => pathname !== action.path)
      .map((action) => ({
        id: action.id,
        name: action.name,
        icon: action.icon,
        section: 'Navigation',
        perform: () => router.push(action.path),
      }));
  }, [pathname, router]);

  return (
    <KBarProvider actions={staticActions}>
      <CommandPaletteInner>{children}</CommandPaletteInner>
    </KBarProvider>
  );
};
