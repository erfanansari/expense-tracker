'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { ArrowLeftRight, Calendar, Clock, DollarSign, FileText, FolderOpen, Tag, X } from 'lucide-react';
import { Drawer } from 'vaul';

import CategoryBadge from '@components/CategoryBadge';

import { formatNumber, formatToFarsiDate } from '@utils';

import { type Expense } from '@/@types/expense';

interface ExpenseDetailsDrawerProps {
  expense: Expense | null;
  isOpen: boolean;
  onClose: () => void;
}

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

const DetailRow = ({ icon, label, value }: DetailRowProps) => (
  <div className="flex items-start gap-3 sm:gap-4">
    <div
      className="border-border-subtle bg-background-secondary flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border sm:h-10 sm:w-10"
      aria-hidden="true"
    >
      {icon}
    </div>
    <div className="min-w-0 flex-1 pt-0.5">
      <span className="text-text-muted text-xs font-medium">{label}</span>
      <div className="text-text-primary mt-1 text-sm font-medium sm:text-base">{value}</div>
    </div>
  </div>
);

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
  const exchangeRate = expense ? Math.round(expense.price_toman / expense.price_usd) : 0;

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
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 md:px-8 md:py-8">
            {expense && (
              <div className="flex flex-col gap-5 sm:gap-6">
                {/* Description */}
                <DetailRow
                  icon={<FileText className="text-text-secondary h-4 w-4" />}
                  label="Description"
                  value={<span className="break-words">{expense.description}</span>}
                />

                {/* Category */}
                <DetailRow
                  icon={<FolderOpen className="text-text-secondary h-4 w-4" />}
                  label="Category"
                  value={<CategoryBadge category={expense.category} size="md" />}
                />

                {/* Date */}
                <DetailRow
                  icon={<Calendar className="text-text-secondary h-4 w-4" />}
                  label="Date"
                  value={
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span>{expense.date}</span>
                      <span className="text-text-muted" dir="rtl">
                        ({farsiDate})
                      </span>
                    </div>
                  }
                />

                {/* Divider */}
                <div className="border-border-subtle border-t" role="separator" />

                {/* Amount in Toman */}
                <DetailRow
                  icon={<DollarSign className="text-text-secondary h-4 w-4" />}
                  label="Amount (Toman)"
                  value={
                    <span className="text-text-primary font-semibold tabular-nums">
                      {formatNumber(expense.price_toman)} Toman
                    </span>
                  }
                />

                {/* Amount in USD */}
                <DetailRow
                  icon={<DollarSign className="text-text-secondary h-4 w-4" />}
                  label="Amount (USD)"
                  value={<span className="text-text-primary tabular-nums">${expense.price_usd.toFixed(2)} USD</span>}
                />

                {/* Exchange Rate */}
                <DetailRow
                  icon={<ArrowLeftRight className="text-text-secondary h-4 w-4" />}
                  label="Exchange Rate"
                  value={
                    <span className="text-text-secondary tabular-nums">{formatNumber(exchangeRate)} Toman/USD</span>
                  }
                />

                {/* Tags */}
                {expense.tags && expense.tags.length > 0 && (
                  <>
                    {/* Divider */}
                    <div className="border-border-subtle border-t" role="separator" />

                    <DetailRow
                      icon={<Tag className="text-text-secondary h-4 w-4" />}
                      label="Tags"
                      value={
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {expense.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="border-border-subtle bg-background-elevated text-text-secondary inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium"
                            >
                              <Tag className="h-3 w-3" aria-hidden="true" />
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      }
                    />
                  </>
                )}

                {/* Divider */}
                <div className="border-border-subtle border-t" role="separator" />

                {/* Created At */}
                <DetailRow
                  icon={<Clock className="text-text-secondary h-4 w-4" />}
                  label="Created At"
                  value={
                    <time dateTime={expense.created_at} className="text-text-secondary">
                      {new Date(expense.created_at).toLocaleString()}
                    </time>
                  }
                />
              </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default ExpenseDetailsDrawer;
