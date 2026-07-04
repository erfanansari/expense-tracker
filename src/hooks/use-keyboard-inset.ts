import { useEffect, useState } from 'react';

/**
 * Height (px) of the on-screen keyboard overlapping the layout viewport.
 *
 * iOS Safari does not resize the layout viewport when the keyboard opens; it
 * pans the visual viewport instead, which drags `position: fixed` elements out
 * of view and reveals the page behind a bottom drawer. We measure the overlap
 * via `visualViewport` so callers can pin themselves above the keyboard, and
 * undo the pan by scrolling the window back to the top.
 *
 * Returns 0 when the keyboard is closed; overlaps under 60px are ignored to
 * filter browser-toolbar show/hide jitter (same heuristic vaul uses).
 */
export function useKeyboardInset(enabled: boolean) {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const visualViewport = window.visualViewport;
    if (!visualViewport) return;

    let frame = 0;
    const update = () => {
      const overlap = Math.max(0, window.innerHeight - visualViewport.height - visualViewport.offsetTop);
      const next = overlap < 60 ? 0 : Math.round(overlap);
      setInset(next);
      if (next > 0 && (visualViewport.offsetTop > 0 || window.scrollY > 0)) {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => window.scrollTo(0, 0));
      }
    };

    update();
    visualViewport.addEventListener('resize', update);
    visualViewport.addEventListener('scroll', update);
    return () => {
      cancelAnimationFrame(frame);
      visualViewport.removeEventListener('resize', update);
      visualViewport.removeEventListener('scroll', update);
      setInset(0);
    };
  }, [enabled]);

  return inset;
}
