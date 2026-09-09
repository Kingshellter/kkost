import { ACCENT_HEX } from "./accent";
import type { Accent } from "@/data/kos";

const SIZES = {
  sm: "h-11 w-11 text-base",
  md: "h-14 w-14 text-xl",
  lg: "h-[72px] w-[72px] text-[28px]",
} as const;

type Props = {
  score: number;
  size?: keyof typeof SIZES;
  accent?: Accent;
  className?: string;
};

/** The circular score chip that anchors every kos in the deck. */
export function ScoreBadge({
  score,
  size = "md",
  accent = "rose",
  className = "",
}: Props) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-extrabold tabular-nums ${SIZES[size]} ${className}`}
      style={{
        backgroundColor: ACCENT_HEX[accent],
        color: accent === "amber" || accent === "sky" ? "#1c2a4e" : "#ffffff",
      }}
    >
      {score.toFixed(1)}
    </span>
  );
}
