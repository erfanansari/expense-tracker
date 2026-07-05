'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { ArrowLeftRight, Calendar, Coins, Tag as TagIcon, X } from 'lucide-react';
import { Drawer } from 'vaul';

import CategoryBadge from '@components/CategoryBadge';
import Money from '@components/Money';

import { formatNumber, formatToFarsiDate } from '@utils';

import { type Expense } from '@/@types/expense';
import { PIVOT_CURRENCY } from '@/constants/currencies';

interface ExpenseDetailsDrawerProps {
  expense: Expense | null;
  isOpen: boolean;
  onClose: () => void;
}

interface MetaCellProps {
  icon: React.ReactNode;
  label: string;
  primary: React.ReactNode;
  secondary?: React.ReactNode;
}

// Compact metadata cell — used inside the 2-column grid below the hero.
const MetaCell = ({ icon, label, primary, secondary }: MetaCellProps) => (
  <div className="border-border-subtle bg-background-secondary/60 flex flex-col gap-1 rounded-xl border p-4">
    <div className="text-text-muted flex items-center gap-1.5 text-[11px] font-medium tracking-wide uppercase">
      <span aria-hidden="true" className="inline-flex">
        {icon}
      </span>
      {label}
    </div>
    <div className="text-text-primary text-sm font-semibold tabular-nums">{primary}</div>
    {secondary && <div className="text-text-muted text-xs tabular-nums">{secondary}</div>}
  </div>
);

const formatCreatedAt = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

const ExpenseDetailsDrawer = ({ expense, isOpen, onClose }: ExpenseDetailsDrawerProps) => {
  // References
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // States
  const [isMobile, setIsMobile] = useState(false);

  // Effects
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Callbacks
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      previousFocusRef.current = document.activeElement as HTMLElement;
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      if (!isOpen && previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    };
  }, [isOpen, handleClose]);

  // Variables
  const farsiDate = expense ? formatToFarsiDate(expense.date) : '';

  return (
    <Drawer.Root
      open={isOpen && expense !== null}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
      direction={isMobile ? 'bottom' : 'left'}
      shouldScaleBackground={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[2px]" />
        <Drawer.Content
          aria-describedby={undefined}
          className={
            isMobile
              ? 'bg-background fixed right-0 bottom-0 left-0 z-50 flex h-[85dvh] max-h-[85dvh] flex-col rounded-t-2xl shadow-2xl outline-none'
              : 'bg-background fixed top-0 bottom-0 left-0 z-50 flex w-[520px] flex-col shadow-2xl outline-none'
          }
        >
          {/* Accessibility: Title must be direct child for screen readers */}
          <Drawer.Title className="sr-only">Expense Details</Drawer.Title>

          {/* Header with drag handle */}
          <div className="border-border-subtle shrink-0 border-b">
            {/* Drag handle - only on mobile */}
            {isMobile && (
              <div className="bg-background-secondary flex justify-center rounded-t-2xl py-3">
                <div className="bg-border-strong h-1 w-10 rounded-full" />
              </div>
            )}

            {/* Title bar */}
            <div
              className={`bg-background-secondary flex items-center justify-between px-4 pb-4 md:px-6 md:pb-5 ${!isMobile ? 'pt-4 md:pt-5' : ''}`}
            >
              <div className="min-w-0 flex-1">
                <h2 className="text-text-primary text-base font-semibold sm:text-lg">Expense Details</h2>
              </div>
              <button
                onClick={handleClose}
                className="text-action-default hover:bg-action-cancel-bg-hover hover:text-action-cancel-text-hover ml-3 rounded-lg p-2 transition-all duration-200"
                aria-label="Close drawer"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6 md:px-8 md:py-8">
            {expense && (
              <div className="flex flex-col gap-5">
                {/* ─── Hero: category + description + hero amount ───────── */}
                <section className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <CategoryBadge category={expense.category} size="md" />
                    <time
                      dateTime={expense.date}
                      className="text-text-muted shrink-0 text-xs tabular-nums"
                      title={farsiDate}
                    >
                      {expense.date}
                    </time>
                  </div>

                  <h3 className="text-text-primary text-xl leading-tight font-semibold break-words sm:text-2xl">
                    {expense.description}
                  </h3>

                  <Money
                    amount={expense.amount}
                    currency={expense.currency}
                    date={expense.date}
                    primaryClassName="text-text-primary text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl"
                    secondaryClassName="text-text-secondary text-base font-medium tabular-nums"
                  />
                </section>

                {/* ─── Tags row (only when present) ───────────────────── */}
                {expense.tags && expense.tags.length > 0 && (
                  <section className="flex flex-wrap gap-1.5">
                    {expense.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="border-border-subtle bg-background-elevated text-text-secondary inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium"
                      >
                        <TagIcon className="h-3 w-3" aria-hidden="true" />
                        {tag.name}
                      </span>
                    ))}
                  </section>
                )}

                {/* ─── Metadata grid: date + exchange rate ────────────── */}
                <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <MetaCell
                    icon={<Calendar className="text-text-muted h-3 w-3" />}
                    label="Date"
                    primary={expense.date}
                    secondary={
                      <span dir="rtl" className="block">
                        {farsiDate}
                      </span>
                    }
                  />
                  <MetaCell
                    icon={<ArrowLeftRight className="text-text-muted h-3 w-3" />}
                    label="Entered in"
                    primary={expense.currency}
                  />
                  {expense.currency !== PIVOT_CURRENCY && (
                    <MetaCell
                      icon={<Coins className="text-text-muted h-3 w-3" />}
                      label="Exchange rate"
                      primary={`1 ${expense.currency} = ${formatNumber(expense.entryRate)} ${PIVOT_CURRENCY}`}
                    />
                  )}
                </section>

                {/* ─── Footer metadata ─────────────────────────────────── */}
                <p className="text-text-muted border-border-subtle/60 mt-1 border-t pt-4 text-xs">
                  Created{' '}
                  <time dateTime={expense.created_at} className="text-text-secondary tabular-nums">
                    {formatCreatedAt(expense.created_at)}
                  </time>
                </p>
              </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default ExpenseDetailsDrawer;
