import { useLayoutEffect } from 'react';

/**
 * Locks page scroll without the layout shift caused by the scrollbar disappearing.
 *
 * When `overflow: hidden` is applied to `<body>`, the vertical scrollbar is removed
 * and the viewport widens — shifting fixed/centered content (modals, navbars, etc.).
 * Compensate by adding right-padding equal to the previous scrollbar width.
 */
export function useLockBodyScroll(locked: boolean) {
  useLayoutEffect(() => {
    if (!locked) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;

    // Width must be measured BEFORE we apply overflow:hidden (which removes the scrollbar).
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [locked]);
}
