"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

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
 * A section link (`SectionLink`) holds every show while its smooth scroll
 * runs and plays the target section on arrival: see `replayOnArrival`.
 *
 * Server-rendered without the attribute, so the content is visible without
 * JavaScript and when the page loads with the block already on screen (a
 * typed `#cara-kerja` URL, a reload halfway down). Driven by
 * IntersectionObserver, never linked to scroll position: a block is either
 * hidden or playing its transition, it cannot sit half-faded (the reason
 * `.reveal` went in Fase 6).
 */
export function Reveal({
  as: Tag = "div",
  margin = 0,
  seam,
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
  /** Set by `BoundaryCircle`: which edge of its section this seam strip is on. */
  seam?: "top" | "bottom";
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement & HTMLUListElement>(null);

  // A layout effect, so a block that must wait for an arrival (a section
  // link from another page) is hidden before the new page first paints.
  useLayoutEffect(() => {
    const block = ref.current;
    if (!block || typeof IntersectionObserver === "undefined") return;
    blocks.set(block, margin);
    const id = takeArrival();
    if (id) {
      // After this commit's other `Reveal`s have registered too.
      queueMicrotask(() => {
        const section = document.getElementById(id);
        if (section) replayOnArrival(section);
      });
    }

    const hide = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) block.dataset.reveal = "hidden";
      },
      { rootMargin: `${margin}px 0px ${margin}px 0px` },
    );
    const show = new IntersectionObserver(
      ([entry]) => {
        // Only after a hide: a block on screen at load keeps no attribute.
        // While a section link scrolls, arrival decides instead.
        if (held || !entry.isIntersecting) return;
        if (block.dataset.reveal === "hidden") block.dataset.reveal = "shown";
      },
      { rootMargin: `${margin}px 0px -15% 0px` },
    );
    hide.observe(block);
    show.observe(block);
    return () => {
      blocks.delete(block);
      hide.disconnect();
      show.disconnect();
    };
  }, [margin]);

  return (
    <Tag ref={ref} data-seam={seam} className={`group/reveal ${className}`}>
      {children}
    </Tag>
  );
}

/** Every mounted `Reveal` block, with its margin. */
const blocks = new Map<HTMLElement, number>();
/** True while a section link's scroll runs: no block shows on the way. */
let held = false;
/** Bumped per arrival, so only the latest one releases the hold. */
let arrivalId = 0;
/** A section id to play once the landing page mounts (link from elsewhere). */
let arrival: string | null = null;

/**
 * Call from a section link that leaves the current page for `/#id`: when
 * the landing page mounts, section `id` plays its entrance on arrival.
 */
export function expectArrival(id: string) {
  arrival = id;
}

/** The pending arrival, cleared: only the first `Reveal` to mount acts on it. */
function takeArrival() {
  const id = arrival;
  arrival = null;
  return id;
}

/**
 * Plays `section`'s entrance when the scroll that is about to happen (or
 * just happened) comes to rest. Its blocks, and the far half of both its
 * seam circles, are hidden now; every show is held until the page stops
 * moving, so the sections passed on the way do not play for nobody; then
 * each hidden block on screen shows, the target's included.
 */
export function replayOnArrival(section: Element) {
  const id = ++arrivalId;
  held = true;
  const prev = section.previousElementSibling;
  const next = section.nextElementSibling;
  for (const block of blocks.keys()) {
    const partner =
      (block.dataset.seam === "bottom" && prev?.contains(block)) ||
      (block.dataset.seam === "top" && next?.contains(block));
    if (section.contains(block) || partner) block.dataset.reveal = "hidden";
  }
  whenScrollSettles(() => {
    if (id !== arrivalId) return;
    held = false;
    // Everything the visitor can see plays, down to the bottom edge (not
    // the usual 85% line) and counting how far a seam circle reaches.
    for (const [block, margin] of blocks) {
      if (block.dataset.reveal !== "hidden") continue;
      const box = block.getBoundingClientRect();
      if (box.bottom + margin > 0 && box.top - margin < innerHeight) {
        block.dataset.reveal = "shown";
      }
    }
  });
}

/**
 * Calls `done` once the page has not scrolled for 6 frames (~100ms), or
 * after ~4s whatever happens. Polling instead of `scrollend`, which not
 * every browser fires, and which never fires when there was nothing to
 * scroll (the link's section already in place).
 */
function whenScrollSettles(done: () => void) {
  let lastY = scrollY;
  let still = 0;
  let frames = 0;
  const tick = () => {
    frames += 1;
    if (scrollY === lastY) still += 1;
    else {
      still = 0;
      lastY = scrollY;
    }
    if (still >= 6 || frames > 240) done();
    else requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
