import { useEffect } from 'react';
import type { RefObject } from 'react';

/**
 * Stops iOS Safari from panning the page when an input inside a bottom sheet
 * receives focus.
 *
 * On iOS, tapping an input always scrolls the page to center it in the visual
 * viewport — even under `overflow: hidden`, and it drags `position: fixed`
 * elements (the sheet, the overlay) off-screen with it, exposing the page
 * behind the sheet. Adapted from react-aria's `preventScrollMobileSafari`
 * (the same technique vaul uses when `repositionInputs` is enabled): translate
 * the input far up for one frame around focus so Safari believes it is already
 * visible and never pans, then reveal it ourselves inside the sheet's own
 * scroll container. A window-scroll watcher undoes any pan that slips through.
 *
 * Only text-keyboard inputs are intercepted — selects and date/time inputs
 * open native pickers on iOS and must keep their default focus behavior.
 */

const NON_TEXT_INPUT_TYPES = new Set([
  'checkbox',
  'radio',
  'range',
  'color',
  'file',
  'image',
  'button',
  'submit',
  'reset',
  'date',
  'datetime-local',
  'time',
  'month',
  'week',
]);

function isTextKeyboardInput(target: EventTarget | null): target is HTMLElement {
  return (
    (target instanceof HTMLInputElement && !NON_TEXT_INPUT_TYPES.has(target.type)) ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

function isIOS() {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPhone|iPad|iPod/.test(navigator.platform) ||
    // iPadOS reports itself as a Mac; distinguish by touch support.
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/** Center `target` inside `area` without ever scrolling the window. */
function revealInScrollArea(area: HTMLElement, target: HTMLElement) {
  const areaRect = area.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const offsetWithinArea = targetRect.top - areaRect.top;
  area.scrollTop += offsetWithinArea - (area.clientHeight / 2 - targetRect.height / 2);
}

export function useIOSKeyboardFocusGuard(enabled: boolean, scrollAreaRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!enabled || !isIOS()) return;

    // Listeners live on `document` (as in react-aria) and filter by
    // containment — the scroll area mounts inside a portal and its ref may
    // not be populated yet when this effect first runs.
    const inArea = (target: EventTarget | null): target is HTMLElement =>
      target instanceof HTMLElement && !!scrollAreaRef.current?.contains(target);

    // Safari decides whether to pan before the focus event fires when tapping,
    // so the transform must be applied on touchend and focus moved manually.
    const onTouchEnd = (event: TouchEvent) => {
      const target = event.target;
      if (isTextKeyboardInput(target) && inArea(target) && target !== document.activeElement) {
        event.preventDefault();
        target.style.transform = 'translateY(-2000px)';
        target.focus();
        requestAnimationFrame(() => {
          target.style.transform = '';
        });
      }
    };

    // Covers focus moves that skip touchend (keyboard next/prev arrows).
    const onFocus = (event: FocusEvent) => {
      const target = event.target;
      if (!isTextKeyboardInput(target) || !inArea(target)) return;
      target.style.transform = 'translateY(-2000px)';
      requestAnimationFrame(() => {
        target.style.transform = '';
        const area = scrollAreaRef.current;
        const visualViewport = window.visualViewport;
        if (!area || !visualViewport) return;
        if (visualViewport.height < window.innerHeight) {
          // Keyboard already open — wait a frame for the transform to clear.
          requestAnimationFrame(() => revealInScrollArea(area, target));
        } else {
          visualViewport.addEventListener(
            'resize',
            () => {
              if (scrollAreaRef.current) revealInScrollArea(scrollAreaRef.current, target);
            },
            { once: true }
          );
        }
      });
    };

    // Last resort: if Safari panned the page anyway, pin it back so fixed
    // elements (which freeze to document coordinates while the keyboard is
    // open) stay aligned with the viewport.
    const onWindowScroll = () => {
      if (window.scrollY !== 0) window.scrollTo(0, 0);
    };

    document.addEventListener('touchend', onTouchEnd, { passive: false, capture: true });
    document.addEventListener('focus', onFocus, true);
    window.addEventListener('scroll', onWindowScroll);
    return () => {
      document.removeEventListener('touchend', onTouchEnd, { capture: true });
      document.removeEventListener('focus', onFocus, true);
      window.removeEventListener('scroll', onWindowScroll);
    };
  }, [enabled, scrollAreaRef]);
}
