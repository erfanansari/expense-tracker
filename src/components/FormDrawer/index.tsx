'use client';

import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { X } from 'lucide-react';
import { Drawer } from 'vaul';

import { useKeyboardInset } from '@hooks/use-keyboard-inset';
import { useLockBodyScroll } from '@hooks/use-lock-body-scroll';

interface FormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  titleFa?: string;
  children: ReactNode;
  isDirty?: boolean;
}

const FormDrawer = ({ isOpen, onClose, title, titleFa, children }: FormDrawerProps) => {
  // References
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // States
  const [isMobile, setIsMobile] = useState(false);

  // iOS keyboard handling: the drawer stays pinned to the viewport bottom (moving
  // it with `bottom:` fights Safari's visual-viewport pan and exposes the page
  // behind it). Instead, pad the internal scroll area by the keyboard height so
  // every field can scroll above the keyboard, and reveal the focused one.
  const keyboardInset = useKeyboardInset(isOpen && isMobile);
  useLockBodyScroll(isOpen);

  useEffect(() => {
    if (keyboardInset === 0) return;
    const focused = document.activeElement;
    if (focused instanceof HTMLElement && scrollAreaRef.current?.contains(focused)) {
      focused.scrollIntoView({ block: 'center' });
    }
  }, [keyboardInset]);

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

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
      direction={isMobile ? 'bottom' : 'left'}
      dismissible
      shouldScaleBackground={false}
      repositionInputs={false}
      noBodyStyles={!isMobile}
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
          <Drawer.Title className="sr-only">{title}</Drawer.Title>

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
                <h2 className="text-text-primary text-base font-semibold sm:text-lg">{title}</h2>
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
          <div
            ref={scrollAreaRef}
            className="flex-1 overflow-x-clip overflow-y-auto overscroll-contain px-5 py-5 md:px-8 md:py-8"
            style={isMobile && keyboardInset > 0 ? { paddingBottom: keyboardInset } : undefined}
          >
            {children}
          </div>

          {/* Solid extender below the sheet: when the iOS keyboard lifts the
              drawer, any sliver between its bottom edge and the keyboard shows
              this instead of the page behind the overlay. */}
          {isMobile && <div aria-hidden="true" className="bg-background absolute inset-x-0 top-full h-screen" />}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default FormDrawer;
