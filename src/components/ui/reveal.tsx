"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * A block that plays its entrance every time it comes into view, scrolling
 * down or back up. It only flips `data-reveal`; the children style both
 * states with `group-data-[reveal=…]/reveal:` classes (`reveal-classes.ts`).
 * Each block of a tall section gets its own `Reveal`, so on a phone the
 * lower blocks wait until they are actually on screen.
 *
 * Two observers, so the block is never seen disappearing:
 * - hide: "hidden" once the block is wholly off screen (plus `margin`);
 * - show: "shown" once it is back in the top 85% of the screen (entering
 *   from above counts straight away).
 *
 * Server-rendered without the attribute, so the content is visible without
 * JavaScript and when the page loads with the block already on screen (a
 * `#cara-kerja` link, a reload halfway down). Driven by IntersectionObserver,
 * never linked to scroll position: a block is either hidden or playing its
 * transition, it cannot sit half-faded (the reason `.reveal` went in Fase 6).
 */
export function Reveal({
  as: Tag = "div",
  margin = 0,
  className = "",
  children,
}: {
  as?: "div" | "ul";
  /**
   * Extra room, in px, around the block before it counts as off screen, and
   * above the screen before it counts as arriving. For a 1px seam strip
   * whose circle reaches `margin` px either side of it.
   */
  margin?: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement & HTMLUListElement>(null);

  useEffect(() => {
    const block = ref.current;
    if (!block || typeof IntersectionObserver === "undefined") return;

    const hide = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) block.dataset.reveal = "hidden";
      },
      { rootMargin: `${margin}px 0px ${margin}px 0px` },
    );
    const show = new IntersectionObserver(
      ([entry]) => {
        // Only after a hide: a block on screen at load keeps no attribute.
        if (entry.isIntersecting && block.dataset.reveal === "hidden") {
          block.dataset.reveal = "shown";
        }
      },
      { rootMargin: `${margin}px 0px -15% 0px` },
    );
    hide.observe(block);
    show.observe(block);
    return () => {
      hide.disconnect();
      show.disconnect();
    };
  }, [margin]);

  return (
    <Tag ref={ref} className={`group/reveal ${className}`}>
      {children}
    </Tag>
  );
}
