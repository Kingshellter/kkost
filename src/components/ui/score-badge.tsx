import { ACCENT_BG } from "./accent";
import type { Accent } from "@/data/kos";

const SIZES = {
  sm: "size-11 text-base",
  md: "size-14 text-xl",
  lg: "size-18 text-3xl",
} as const;

export type ScoreBadgeSize = keyof typeof SIZES;

type Props = {
  score: number;
  size?: ScoreBadgeSize;
  accent?: Accent;
  /** Shown instead of the number — e.g. "Baru" for a kos with no reviews yet. */
  label?: string;
  className?: string;
};

/** The circular score chip that anchors every kos in the deck. */
export function ScoreBadge({
  score,
  size = "md",
  accent = "rose",
  label,
  className = "",
}: Props) {
  // Only the two light grounds take ink; ACCENT_ON would give ink an amber
  // number, which is right for the scoring circles but not for "Baru".
  const text = accent === "amber" || accent === "sky" ? "text-ink" : "text-white";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-extrabold tabular-nums ${ACCENT_BG[accent]} ${text} ${SIZES[size]} ${className}`}
    >
      <span className={label ? "text-xs tracking-wide" : undefined}>
        {label ?? score.toFixed(1)}
      </span>
    </span>
  );
}
