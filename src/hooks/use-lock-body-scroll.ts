import { useLayoutEffect } from 'react';

/**
 * Locks page scroll without the layout shift caused by the scrollbar disappearing.
 *
 * When `overflow: hidden` is applied to `<body>`, the vertical scrollbar is removed
 * and the viewport widens — shifting fixed/centered content (modals, navbars, etc.).
 * Compensate by adding right-padding equal to the width the viewport actually gained.
 * Measuring the delta (rather than assuming the pre-lock scrollbar width) stays
 * correct when something else (e.g. vaul/radix's own scroll lock) already removed
 * the scrollbar, and on overlay-scrollbar systems where nothing changes.
 */
export function useLockBodyScroll(locked: boolean) {
  useLayoutEffect(() => {
    if (!locked) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;

    // Width must be measured BEFORE we apply overflow:hidden (which removes the scrollbar).
    const widthBefore = document.documentElement.clientWidth;

    body.style.overflow = 'hidden';

    // How much the viewport actually widened once the scrollbar was removed.
    const widthGained = document.documentElement.clientWidth - widthBefore;
    if (widthGained > 0) {
      body.style.paddingRight = `${widthGained}px`;
    }

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [locked]);
}
