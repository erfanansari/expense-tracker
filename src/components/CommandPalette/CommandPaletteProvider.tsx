'use client';

import { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import type { MutableRefObject, ReactNode } from 'react';

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
  useRegisterActions,
} from 'kbar';
import { DollarSign, LayoutDashboard, PieChart, Plus, Receipt, Search, Settings, TrendingUp } from 'lucide-react';

import { useAuth } from '@hooks/use-auth';

import { useDrawerStore } from '@stores/drawer';

interface CommandPaletteContextType {
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

type ToggleRef = MutableRefObject<(() => void) | null>;

/**
 * The kbar tree is mounted ONLY for signed-in users — kbar hardwires a global
 * ⌘K handler and body scroll-lock that can't be configured away, so on auth
 * pages the palette simply doesn't exist. Children render outside KBarProvider
 * (they don't need kbar context), which keeps auth changes from remounting the
 * app; the toggle ref is how the app (TopNav) reaches the palette while it's
 * mounted.
 */
export const CommandPaletteProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const toggleRef: ToggleRef = useRef(null);

  const contextValue = useMemo<CommandPaletteContextType>(() => ({ toggle: () => toggleRef.current?.() }), []);

  return (
    <CommandPaletteContext.Provider value={contextValue}>
      {children}
      {user && <CommandPalette toggleRef={toggleRef} />}
    </CommandPaletteContext.Provider>
  );
};

// The actual palette — only ever mounted with a signed-in user.
function CommandPalette({ toggleRef }: { toggleRef: ToggleRef }) {
  const router = useRouter();
  const pathname = usePathname();
  const openExpenseDrawer = useDrawerStore((state) => state.openExpenseDrawer);
  const openIncomeDrawer = useDrawerStore((state) => state.openIncomeDrawer);
  const openAssetDrawer = useDrawerStore((state) => state.openAssetDrawer);

  const actions = useMemo<Action[]>(() => {
    const navActions = [
      { id: 'nav-overview', name: 'Go to Overview', path: '/overview', icon: <LayoutDashboard className="h-4 w-4" /> },
      {
        id: 'nav-expenses',
        name: 'Go to Expenses',
        path: '/expenses',
        icon: <Receipt className="h-4 w-4" />,
      },
      { id: 'nav-income', name: 'Go to Income', path: '/income', icon: <DollarSign className="h-4 w-4" /> },
      { id: 'nav-assets', name: 'Go to Assets', path: '/assets', icon: <TrendingUp className="h-4 w-4" /> },
      { id: 'nav-reports', name: 'Go to Reports', path: '/reports', icon: <PieChart className="h-4 w-4" /> },
      { id: 'nav-settings', name: 'Go to Settings', path: '/settings', icon: <Settings className="h-4 w-4" /> },
    ]
      .filter((a) => pathname !== a.path)
      .map((a) => ({
        id: a.id,
        name: a.name,
        icon: a.icon,
        section: 'Navigation',
        perform: () => router.push(a.path),
      }));

    const createActions: Action[] = [
      {
        id: 'create-expense',
        name: 'Add Expense',
        section: 'Create',
        icon: <Plus className="h-4 w-4" />,
        shortcut: ['e'],
        keywords: 'add new expense spend',
        perform: () => openExpenseDrawer(),
      },
      {
        id: 'create-income',
        name: 'Add Income',
        section: 'Create',
        icon: <Plus className="h-4 w-4" />,
        shortcut: ['i'],
        keywords: 'add new income earn salary',
        perform: () => openIncomeDrawer(),
      },
      {
        id: 'create-asset',
        name: 'Add Asset',
        section: 'Create',
        icon: <Plus className="h-4 w-4" />,
        shortcut: ['a'],
        keywords: 'add new asset wealth investment',
        perform: () => openAssetDrawer(),
      },
    ];

    return [...createActions, ...navActions];
  }, [pathname, router, openExpenseDrawer, openIncomeDrawer, openAssetDrawer]);

  return (
    // The palette must NOT lock body scroll — not kbar's lock, not ours.
    // Locks around the palette race with Radix's lock (inside vaul drawers)
    // in both orders and shift the layout by a scrollbar width:
    //  - drawer→⌘K: kbar's lock stacks inline margin-right on top of Radix's
    //    stylesheet compensation;
    //  - ⌘K→"Add expense": the drawer mounts while a palette lock holds the
    //    scrollbar hidden, so Radix measures a 0 gap and under-compensates
    //    when the palette lock releases.
    // A transient keyboard overlay doesn't need scroll-locking; the backdrop
    // already swallows pointer interaction.
    <KBarProvider options={{ disableDocumentLock: true }}>
      <KBarConnector toggleRef={toggleRef} actions={actions} />
      <CommandPaletteUI />
    </KBarProvider>
  );
}

// Registers the (pathname-dependent) actions and exposes kbar's toggle to the
// provider's ref for the lifetime of the palette.
function KBarConnector({ toggleRef, actions }: { toggleRef: ToggleRef; actions: Action[] }) {
  const { query } = useKBar();

  useRegisterActions(actions, [actions]);

  useEffect(() => {
    toggleRef.current = () => query.toggle();
    return () => {
      toggleRef.current = null;
    };
  }, [query, toggleRef]);

  return null;
}

// Custom UI component using kbar primitives
function CommandPaletteUI() {
  return (
    <KBarPortal>
      <KBarPositioner className="fixed inset-0 z-(--z-command-palette) flex items-start justify-center bg-black/30 px-4 pt-[20vh] backdrop-blur-[2px]">
        <KBarAnimator className="border-border-subtle bg-background w-full max-w-xl overflow-hidden rounded-xl border shadow-[0_24px_60px_-12px_rgba(0,0,0,0.28),0_8px_24px_-8px_rgba(0,0,0,0.12)]">
          {/* Search input */}
          <div className="border-border-subtle flex items-center gap-3 border-b px-4 py-3">
            <Search className="text-text-muted h-4 w-4 shrink-0" />
            <KBarSearch
              className="text-text-primary placeholder:text-text-muted flex-1 bg-transparent text-sm outline-none"
              placeholder="Type a command or search..."
            />
            <kbd className="bg-background-elevated text-text-muted hidden rounded px-2 py-1 text-[11px] font-medium sm:inline-block">
              ESC
            </kbd>
          </div>

          {/* Results list */}
          <RenderResults />

          {/* Footer hints */}
          <div className="border-border-subtle text-text-muted flex items-center justify-center gap-4 border-t px-4 py-2 text-[11px]">
            <span className="flex items-center gap-1.5">
              <kbd className="bg-background-elevated rounded px-1.5 py-0.5 font-medium">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="bg-background-elevated rounded px-1.5 py-0.5 font-medium">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="bg-background-elevated rounded px-1.5 py-0.5 font-medium">ESC</kbd>
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
    <div className="flex max-h-96 flex-col gap-0.5 overflow-y-auto overscroll-contain p-1">
      {results.length === 0 ? (
        <div className="text-text-muted px-4 py-8 text-center text-sm">No commands found</div>
      ) : (
        <KBarResults
          items={results}
          onRender={({ item, active }) =>
            typeof item === 'string' ? (
              // Section header (e.g., "Create", "Navigation")
              <div className="text-text-muted px-2.5 pt-2 pb-1 text-[11px] font-semibold tracking-wide uppercase">
                {item}
              </div>
            ) : (
              // Command item
              <div
                className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-[13px] transition-colors duration-100 ${
                  active ? 'bg-background-elevated text-text-primary' : 'text-text-secondary'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon && <span className="text-text-muted">{item.icon}</span>}
                  <span className="font-medium">{item.name}</span>
                </div>
                {item.shortcut && item.shortcut.length > 0 && (
                  <kbd className="bg-background-secondary text-text-muted hidden rounded px-1.5 py-0.5 text-[11px] font-medium sm:inline-block">
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
