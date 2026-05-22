'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

import { X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

import { useLockBodyScroll } from '@hooks/use-lock-body-scroll';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  titleFa?: string;
  children: ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

const Modal = ({ isOpen, onClose, title, titleFa, children, className, showCloseButton = true }: ModalProps) => {
  // References
  const modalRef = useRef<HTMLDivElement>(null);

  // Callbacks
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  const handleOverlayClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Lock page scroll while open (no layout shift)
  useLockBodyScroll(isOpen);

  // Effects
  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div className="animate-backdrop-fade absolute inset-0 bg-black/30 backdrop-blur-[3px]" aria-hidden="true" />

      {/* Modal content */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={twMerge(
          'border-border-subtle bg-background relative max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl border shadow-[0_24px_60px_-12px_rgba(0,0,0,0.28),0_8px_24px_-8px_rgba(0,0,0,0.12)]',
          'animate-modal-pop',
          className
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="border-border-subtle bg-background-secondary flex items-center justify-between border-b px-5 py-3.5 sm:px-6 sm:py-4">
            {title ? (
              <div className="min-w-0 flex-1">
                <h2 id="modal-title" className="text-text-primary truncate text-base font-semibold sm:text-lg">
                  {title}
                </h2>
                {titleFa && (
                  <p className="text-text-muted mt-0.5 text-xs" dir="rtl">
                    {titleFa}
                  </p>
                )}
              </div>
            ) : (
              <div />
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-text-muted hover:bg-background-elevated hover:text-text-primary focus-visible:ring-blue/30 focus-visible:border-blue -mr-1 ml-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
