import { useEffect, useState } from 'react';

/**
 * Visual-viewport geometry while the on-screen keyboard is open.
 *
 * iOS Safari does not resize the layout viewport when the keyboard opens; it
 * shrinks and *pans* the visual viewport instead. `position: fixed` elements
 * stay glued to the layout viewport, so once Safari pans to reveal the focused
 * input, the visible area extends past the layout viewport's bottom edge —
 * a region no fixed element (drawer, overlay, extender) can paint into. The
 * only reliable way to keep a bottom sheet flush with the keyboard is to
 * reposition it onto the visual viewport itself, tracking pan/resize events.
 *
 * `inset` is the keyboard height (0 = closed); `offsetTop`/`height` describe
 * the visible rectangle in layout-viewport coordinates. Keyboards under 60px
 * are ignored to filter browser-toolbar show/hide jitter (vaul's heuristic).
 */
export interface KeyboardViewport {
  inset: number;
  offsetTop: number;
  height: number;
}

const KEYBOARD_CLOSED: KeyboardViewport = { inset: 0, offsetTop: 0, height: 0 };

export function useKeyboardInset(enabled: boolean): KeyboardViewport {
  const [viewport, setViewport] = useState<KeyboardViewport>(KEYBOARD_CLOSED);

  useEffect(() => {
    if (!enabled) return;
    const visualViewport = window.visualViewport;
    if (!visualViewport) return;

    const update = () => {
      const keyboardHeight = Math.max(0, window.innerHeight - visualViewport.height);
      if (keyboardHeight < 60) {
        setViewport(KEYBOARD_CLOSED);
      } else {
        setViewport({
          inset: Math.round(keyboardHeight),
          offsetTop: Math.round(visualViewport.offsetTop),
          height: Math.round(visualViewport.height),
        });
      }
    };

    update();
    visualViewport.addEventListener('resize', update);
    visualViewport.addEventListener('scroll', update);
    return () => {
      visualViewport.removeEventListener('resize', update);
      visualViewport.removeEventListener('scroll', update);
      setViewport(KEYBOARD_CLOSED);
    };
  }, [enabled]);

  return viewport;
}
