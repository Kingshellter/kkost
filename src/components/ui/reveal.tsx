"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * A block that plays its entrance once, the first time it scrolls into view.
 * It only flips `data-reveal` ("hidden" → "shown"); the children style both
 * states with `group-data-[reveal=…]/reveal:` classes (`REVEAL_*` in
 * how-it-works.tsx). Each block of a tall section gets its own `Reveal`, so
 * on a phone the lower blocks wait until they are actually on screen.
 *
 * Server-rendered without the attribute, so the content is visible without
 * JavaScript and when the page loads with the block already on screen (a
 * `#cara-kerja` link, a reload halfway down). It hides only while still
 * below the fold, where nobody sees it go. Triggered by an
 * IntersectionObserver, never linked to scroll position: once shown it cannot
 * sit half-faded, the reason `.reveal` was removed in Fase 6.
 */
export function Reveal({
  as: Tag = "div",
  className = "",
  children,
}: {
  as?: "div" | "ul";
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement & HTMLUListElement>(null);

  useEffect(() => {
    const block = ref.current;
    if (!block || typeof IntersectionObserver === "undefined") return;
    if (block.getBoundingClientRect().top < window.innerHeight) return;

    block.dataset.reveal = "hidden";
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        block.dataset.reveal = "shown";
        observer.disconnect();
      },
      // Fires once the block's top is ~15% above the bottom edge.
      { rootMargin: "0px 0px -15% 0px" },
    );
    observer.observe(block);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`group/reveal ${className}`}>
      {children}
    </Tag>
  );
}
