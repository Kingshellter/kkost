/**
 * The loading mark inside a busy button. A fast turn (0.6s, not Tailwind's
 * 1s) reads as a quicker wait for the same wait. Under reduced motion it
 * stands still as a broken ring, which still says "working" next to the
 * label. Decorative: the button's own text and `aria-busy` carry the meaning.
 */
export function Spinner() {
  return (
    <span
      aria-hidden
      className="size-4 shrink-0 rounded-full border-2 border-current border-r-transparent motion-safe:animate-spin motion-safe:[animation-duration:600ms]"
    />
  );
}
