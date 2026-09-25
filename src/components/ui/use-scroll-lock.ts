"use client";

import { useEffect } from "react";

/**
 * Freezes the page behind a modal while the calling component is mounted.
 *
 * `overflow: hidden` on <html> alone is not enough on iOS Safari: a swipe on
 * the dim backdrop, or a flick that runs off the end of the dialog's own
 * scroll, still moves the page underneath. Pinning <body> with
 * `position: fixed` at the current scroll offset is the one lock iOS
 * honours; on release the offset goes back into `window.scrollTo`, so the
 * page is exactly where it was.
 *
 * The right padding stands in for the desktop scrollbar that disappears with
 * the lock, so the layout underneath does not jump sideways.
 */
export function useScrollLock() {
  useEffect(() => {
    const root = document.documentElement;
    const { body } = document;
    const y = window.scrollY;
    const scrollbar = window.innerWidth - root.clientWidth;
    const prev = {
      overflow: root.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      paddingRight: body.style.paddingRight,
    };

    root.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${y}px`;
    body.style.width = "100%";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    return () => {
      root.style.overflow = prev.overflow;
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      body.style.paddingRight = prev.paddingRight;
      // Instant: `scroll-behavior` is never smooth on html (globals.css).
      window.scrollTo(0, y);
    };
  }, []);
}
