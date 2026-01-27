'use client';

import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { X } from 'lucide-react';
import { Drawer } from 'vaul';

import DragHandle from './DragHandle';

interface FormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  titleFa?: string;
  children: ReactNode;
  isDirty?: boolean;
}

export default function FormDrawer({ isOpen, onClose, title, titleFa, children, isDirty = false }: FormDrawerProps) {
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleClose = useCallback(() => {
    if (isDirty) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmed) return;
    }
    onClose();
  }, [isDirty, onClose]);

  // Handle ESC key
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

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
      direction={isMobile ? 'bottom' : 'left'}
      dismissible={!isDirty}
      shouldScaleBackground={false}
      repositionInputs={false}
      handleOnly={isMobile}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[2px]" />
        <Drawer.Content
          className={
            isMobile
              ? 'bg-background fixed right-0 bottom-0 left-0 z-50 flex h-[85dvh] max-h-[85dvh] flex-col rounded-t-2xl shadow-2xl outline-none'
              : 'bg-background fixed top-0 bottom-0 left-0 z-50 flex w-[520px] flex-col shadow-2xl outline-none'
          }
          aria-labelledby="drawer-title"
        >
          {/* Header with drag handle */}
          <div className="border-border-subtle shrink-0 border-b">
            {/* Drag handle - only on mobile */}
            <div className="bg-background-secondary rounded-t-2xl py-2">{isMobile && <DragHandle />}</div>

            {/* Title bar */}
            <div className="bg-background-secondary flex items-center justify-between px-4 pb-4 md:px-6 md:pb-5">
              <div className="min-w-0 flex-1">
                <Drawer.Title className="text-text-primary text-base font-semibold sm:text-lg">{title}</Drawer.Title>
                {titleFa && (
                  <p className="text-text-muted mt-1 text-xs" dir="rtl">
                    {titleFa}
                  </p>
                )}
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
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 md:px-8 md:py-8">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
