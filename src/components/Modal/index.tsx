'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

import { X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

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
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle ESC key to close modal
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  // Handle click outside to close modal
  const handleOverlayClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Add/remove event listeners and manage body scroll
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  // Focus trap - focus modal when opened
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
      <div
        className="animate-in fade-in absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-all duration-300"
        aria-hidden="true"
      />

      {/* Modal content */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={twMerge(
          'border-border-subtle bg-background relative max-h-[90vh] w-full max-w-lg overflow-hidden rounded-xl border shadow-2xl',
          'animate-in fade-in zoom-in-95 duration-300',
          className
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="border-border-subtle bg-background-secondary flex items-center justify-between border-b px-4 py-3 sm:px-6 sm:py-4">
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
                className="text-text-muted hover:bg-background-elevated hover:text-text-primary focus:ring-primary -mr-1 ml-4 flex-shrink-0 rounded-lg p-2 transition-colors duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
