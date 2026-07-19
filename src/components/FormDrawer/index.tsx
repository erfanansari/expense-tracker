'use client';

import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { useLocale, useTranslations } from 'next-intl';

import { X } from 'lucide-react';
import { Drawer } from 'vaul';

import { useIOSKeyboardFocusGuard } from '@hooks/use-ios-keyboard-focus-guard';
import { useKeyboardInset } from '@hooks/use-keyboard-inset';

interface FormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  isDirty?: boolean;
}

const FormDrawer = ({ isOpen, onClose, title, children }: FormDrawerProps) => {
  // Customs
  const t = useTranslations('common');
  const isRtl = useLocale() === 'fa';

  // References
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // States
  const [isMobile, setIsMobile] = useState(false);

  // iOS keyboard handling: while the keyboard is open the sheet is repositioned
  // onto the *visual* viewport (top/height track every pan and resize), so its
  // bottom edge always coincides with the keyboard top. Anchoring to the layout
  // viewport instead leaves a strip below it visible whenever Safari pans —
  // a region no fixed element can paint into (see useKeyboardInset).
  const keyboard = useKeyboardInset(isOpen && isMobile);
  // Root-cause guard: stop Safari from panning the page when an input gains
  // focus (the pan drags every fixed element off-screen and exposes the page
  // behind the sheet — the viewport tracking above can't see that pan because
  // it arrives as a window scroll, not a visualViewport offset).
  useIOSKeyboardFocusGuard(isOpen && isMobile, scrollAreaRef);
  // Page scroll locking is owned by Radix Dialog (inside vaul): it applies
  // overflow:hidden + scrollbar-gap compensation on open and removes both
  // atomically when the exit animation finishes. Adding our own lock here
  // creates a second owner whose earlier cleanup leaves the 500ms exit window
  // uncompensated — the page visibly shifts when Radix finally unlocks.

  useEffect(() => {
    if (keyboard.inset === 0) return;
    const focused = document.activeElement;
    if (focused instanceof HTMLElement && scrollAreaRef.current?.contains(focused)) {
      focused.scrollIntoView({ block: 'center' });
    }
  }, [keyboard.inset]);

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

  // Handle Tab ourselves instead of leaving it to native sequential focus.
  // During a native Tab transition focus sits on <body> for a moment; if the
  // element being left unmounts DOM on blur (react-select removes its aria-live
  // region), Radix FocusScope's MutationObserver sees "nodes removed while
  // body is focused" and yanks focus back to the dialog container, hijacking
  // the move. An explicit .focus() commits synchronously, so that window never
  // exists and the cycle also stays trapped inside the drawer.
  const handleTabKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab' || event.defaultPrevented) return;
    const container = event.currentTarget;
    const focusable = Array.from(
      container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      // tabIndex >= 0 also drops roving-tabindex members (e.g. calendar day
      // buttons marked tabindex="-1") that the tag selectors still match.
    ).filter((el) => el.offsetParent !== null && el.tabIndex >= 0);
    if (focusable.length === 0) return;

    const index = focusable.indexOf(document.activeElement as HTMLElement);
    let next: HTMLElement;
    if (index === -1) {
      next = event.shiftKey ? focusable[focusable.length - 1] : focusable[0];
    } else {
      next = focusable[(index + (event.shiftKey ? -1 : 1) + focusable.length) % focusable.length];
    }
    event.preventDefault();
    next.focus();
  }, []);

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

  let drawerDirection: 'bottom' | 'right' | 'left' = 'left';
  if (isMobile) drawerDirection = 'bottom';
  else if (isRtl) drawerDirection = 'right';

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
      direction={drawerDirection}
      // Move focus into the dialog on open — without this, focus stays on the
      // opener behind the overlay and Radix's focus trap never engages, so Tab
      // walks the obscured background page instead of the form.
      autoFocus
      dismissible
      shouldScaleBackground={false}
      repositionInputs={false}
      noBodyStyles={!isMobile}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[2px]" />
        <Drawer.Content
          aria-describedby={undefined}
          onKeyDown={handleTabKeyDown}
          style={
            isMobile && keyboard.inset > 0
              ? { top: keyboard.offsetTop, bottom: 'auto', height: keyboard.height, maxHeight: keyboard.height }
              : undefined
          }
          className={
            isMobile
              ? 'bg-background fixed inset-x-0 bottom-0 z-50 flex h-[85dvh] max-h-[85dvh] flex-col rounded-t-2xl shadow-2xl outline-none'
              : 'bg-background fixed start-0 top-0 bottom-0 z-50 flex w-[520px] flex-col shadow-2xl outline-none'
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
              </div>
              <button
                onClick={handleClose}
                className="text-action-default hover:bg-action-cancel-bg-hover hover:text-action-cancel-text-hover ms-3 rounded-lg p-2 transition-all duration-200"
                aria-label={t('closeDrawer')}
                title={t('closeDrawer')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div
            ref={scrollAreaRef}
            className="flex-1 overflow-x-clip overflow-y-auto overscroll-contain px-5 py-5 md:px-8 md:py-8"
          >
            {children}
          </div>

          {/* Solid extender below the sheet: covers transient slivers between
              the sheet's bottom edge and the keyboard while keyboard geometry
              updates lag a frame behind Safari's pan animation. */}
          {isMobile && <div aria-hidden="true" className="bg-background absolute inset-x-0 top-full h-screen" />}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default FormDrawer;
