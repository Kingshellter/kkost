/**
 * A motion token's duration in milliseconds, read from the CSS variable in
 * globals.css (`durationMs("--duration-fast")` → 150), so an exit's timer
 * and its transition can never disagree. Browser only.
 *
 * Exits wait on this timer rather than `transitionend`: that event never
 * fires when nothing transitions (a hidden tab, a browser without the
 * property), and a dialog that waits for it would never close.
 */
export function durationMs(token: `--duration-${string}`, fallback = 150) {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim();
  const value = parseFloat(raw);
  if (Number.isNaN(value)) return fallback;
  return raw.endsWith("ms") ? value : value * 1000;
}
