import { Reveal } from "./reveal";
import { REVEAL_GROW } from "./reveal-classes";

/**
 * A decorative circle sitting across the line where two sections meet.
 *
 * It is drawn twice — the bottom half-slot of the upper section and the top
 * half-slot of the lower one — with the same size and horizontal position, so
 * each section's `overflow-hidden` clips its own half and the two halves read
 * as one whole circle. Drawing it once would not work: it would either be
 * sliced flat at the seam, or sit on top of the next section's text.
 *
 * The transition between sections: when the seam reaches the screen, both
 * halves fade in and grow from `--reveal-pop` together. Each half hangs from
 * a 1px `Reveal` strip lying exactly on the seam, so the two observers fire
 * at the same scroll position, and each circle's centre is on the seam, so
 * growing from the centre keeps the halves meeting as one circle. (They used
 * to drift on the scroll timeline; that went in Fase 6. This replays each
 * time the seam comes back into view, but is never tied to scroll position.)
 */
export function BoundaryCircle({
  edge,
  circle,
}: {
  /** Which edge of the section this half sits on. */
  edge: "top" | "bottom";
  /** One of `SEAMS` — size, horizontal position and colour, shared by both halves. */
  circle: string;
}) {
  return (
    // margin: the largest circle reaches 190px either side of the seam, so
    // a half never vanishes while it is still on screen.
    <Reveal
      margin={200}
      seam={edge}
      className={`pointer-events-none absolute inset-x-0 h-px ${
        edge === "top" ? "top-0" : "bottom-0"
      }`}
    >
      <div
        aria-hidden
        className={`absolute rounded-full ${
          edge === "top" ? "top-0 -translate-y-1/2" : "bottom-0 translate-y-1/2"
        } ${circle} ${REVEAL_GROW}`}
      />
    </Reveal>
  );
}

/**
 * One entry per seam, used by the section above and the one below. Spelled out
 * as literals so Tailwind sees every class.
 */
export const SEAMS = {
  /** Hero (cream) → Cara kerja (white). */
  heroImpact:
    "-left-28 h-[260px] w-[260px] bg-lavender lg:-left-24 lg:h-[380px] lg:w-[380px]",
  /** Map band (ink) → Cari kos (cream). */
  mapBrowse:
    "-right-24 h-[200px] w-[200px] bg-amber lg:right-[6%] lg:h-[280px] lg:w-[280px]",
  /** Cari kos (cream) → Masuk (amber). A ring reads on both. */
  browseCta:
    "right-[10%] h-[160px] w-[160px] border-[16px] border-black/[0.07] lg:right-[22%] lg:h-[220px] lg:w-[220px] lg:border-[22px]",
} as const;
