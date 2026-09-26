import type { CSSProperties } from "react";

/*
 * Entrance classes for the landing sections. Two triggers, one look:
 *
 * - REVEAL_* key to the enclosing `<Reveal>` (group/reveal; never nest
 *   one inside another, the classes match any ancestor): hidden values
 *   apply only while it says "hidden"; the transition and its stagger delay
 *   only once it says "shown", so hiding is instant and nothing waits on a
 *   delay afterwards.
 * - LOAD_* are for the hero, which is on screen when the page opens: they
 *   start from `@starting-style` (Tailwind `starting:`), so they play on the
 *   first paint with no JavaScript and no flash. They also carry the REVEAL
 *   hidden values, so inside a `<Reveal>` the hero replays when scrolled back
 *   to. Only on wrappers that have no other transition, because their delay
 *   stays on.
 *
 * Every distance is a `--reveal-*` token that collapses to 0 (or 1) under
 * reduced motion, which leaves the fades and their order. Delays are
 * `--stagger-step × --step`; set the step with `step(n)`.
 */

/** Which beat of the entrance an element plays on (× `--stagger-step`). */
export const step = (n: number) => ({ "--step": n }) as CSSProperties;

export const REVEAL_BASE =
  "group-data-[reveal=shown]/reveal:transition-[opacity,translate,scale] group-data-[reveal=shown]/reveal:duration-(--duration-reveal) group-data-[reveal=shown]/reveal:ease-out group-data-[reveal=shown]/reveal:delay-[calc(var(--stagger-step)*var(--step,0))]";
/** Fades in and rises `--reveal-shift`. */
export const REVEAL_RISE = `${REVEAL_BASE} group-data-[reveal=hidden]/reveal:opacity-0 group-data-[reveal=hidden]/reveal:translate-y-(--reveal-shift)`;
/** A headline line coming up from under its `overflow-hidden` mask (`MaskLine`). */
export const REVEAL_LINE = `${REVEAL_BASE} group-data-[reveal=hidden]/reveal:opacity-0 group-data-[reveal=hidden]/reveal:translate-y-(--reveal-line)`;
/** Grows from `--reveal-pop`. No fade: for things inside a block that fades. */
export const REVEAL_POP = `${REVEAL_BASE} group-data-[reveal=hidden]/reveal:scale-(--reveal-pop)`;
/** Fades in and grows from `--reveal-pop`: decorative circles on their own. */
export const REVEAL_GROW = `${REVEAL_POP} group-data-[reveal=hidden]/reveal:opacity-0`;

const LOAD_BASE =
  "transition-[opacity,translate,scale] duration-(--duration-reveal) ease-out delay-[calc(var(--stagger-step)*var(--step,0))]";
/** Hero: fades in and rises `--reveal-shift` on page load. */
export const LOAD_RISE = `${LOAD_BASE} starting:opacity-0 starting:translate-y-(--reveal-shift) group-data-[reveal=hidden]/reveal:opacity-0 group-data-[reveal=hidden]/reveal:translate-y-(--reveal-shift)`;
/** Hero: grows from `--reveal-pop` on page load, no fade (inside a fading block). */
export const LOAD_POP = `${LOAD_BASE} starting:scale-(--reveal-pop) group-data-[reveal=hidden]/reveal:scale-(--reveal-pop)`;
/** Hero: fades in and grows from `--reveal-pop` on page load. */
export const LOAD_GROW = `${LOAD_BASE} starting:opacity-0 starting:scale-(--reveal-pop) group-data-[reveal=hidden]/reveal:opacity-0 group-data-[reveal=hidden]/reveal:scale-(--reveal-pop)`;
