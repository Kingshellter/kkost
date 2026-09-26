import { durationMs } from "@/lib/motion";

/** Extra time per pixel travelled, between the two glide tokens. */
const MS_PER_PX = 0.12;

/** The glide in progress, so a second click takes over from the first. */
let current: (() => void) | null = null;

/**
 * Stops the glide in progress, if any, where it is (its `onArrive` still
 * fires). Call before holding a new target, so the old glide's arrival
 * cannot release the new hold.
 */
export function stopGlide() {
  current?.();
}

/**
 * Scrolls the page to `target` (respecting its `scroll-margin-top`) for
 * `SectionLink`. Replaces the browser's `scrollIntoView({ behavior:
 * "smooth" })`, which took ~850ms for a long jump on a stiff curve and gave
 * no hook for when it lands.
 *
 * - Duration grows with the distance, from `--duration-glide-min` to
 *   `--duration-glide-max`; the curve is ease-in-out (on-screen movement),
 *   gentle at both ends.
 * - `onArrive` fires once, when the page is 90% of the way there, so the
 *   target's entrance starts as it settles rather than after a dead pause;
 *   also on a cancel.
 * - The visitor wins: a wheel, touch, key or pointer press stops the glide
 *   where it is.
 * - Reduced motion: jumps at once.
 */
export function glideTo(target: Element, onArrive: () => void) {
  stopGlide();

  const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  const from = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const to = Math.min(
    max,
    Math.max(0, target.getBoundingClientRect().top + from - margin),
  );
  const distance = to - from;

  let arrived = false;
  const arrive = () => {
    if (arrived) return;
    arrived = true;
    onArrive();
  };

  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (still || Math.abs(distance) < 2) {
    window.scrollTo(0, to);
    arrive();
    return;
  }

  const duration = Math.min(
    durationMs("--duration-glide-max", 640),
    durationMs("--duration-glide-min", 320) + Math.abs(distance) * MS_PER_PX,
  );

  let frame = 0;
  const stop = () => {
    cancelAnimationFrame(frame);
    for (const type of INTERRUPTS) removeEventListener(type, stop);
    if (current === stop) current = null;
    arrive();
  };
  for (const type of INTERRUPTS) {
    addEventListener(type, stop, { passive: true, once: true });
  }
  current = stop;

  let start: number | null = null;
  const step = (now: number) => {
    start ??= now;
    const t = Math.min(1, (now - start) / duration);
    const eased = easeInOutCubic(t);
    window.scrollTo(0, from + distance * eased);
    if (eased >= 0.9) arrive();
    if (t < 1) frame = requestAnimationFrame(step);
    else stop();
  };
  frame = requestAnimationFrame(step);
}

/** Input that means the visitor has taken the scroll back. */
const INTERRUPTS = ["wheel", "touchstart", "keydown", "pointerdown"] as const;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}
