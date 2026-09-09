import { ACCENT_HEX } from "./accent";
import type { FacilityScore } from "@/data/kos";

/** One labelled 0–5 bar from the hero card's score breakdown. */
export function FacilityBar({ label, score, accent }: FacilityScore) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-[74px] shrink-0 text-sm font-semibold text-ink">
        {label}
      </span>
      <span
        className="relative h-[9px] flex-1 overflow-hidden rounded-full bg-cream-deep"
        role="img"
        aria-label={`${label} ${score.toFixed(1)} dari 5`}
      >
        <span
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${(score / 5) * 100}%`,
            backgroundColor: ACCENT_HEX[accent],
          }}
        />
      </span>
    </div>
  );
}
