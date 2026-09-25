import { accentForScore } from "./accent";
import { ScoreBadge, type ScoreBadgeSize } from "./score-badge";
import type { Kos } from "@/data/kos";

/**
 * ScoreBadge plus the one kos-specific rule: a kos nobody has reviewed has no
 * score to show, so it gets a dark "Baru" chip rather than a misleading 0.0.
 *
 * This exists because that rule was written out at four call sites and two of
 * them had drifted — cards and the hero rendered 0.0 for unreviewed kos while
 * the sidebar and the detail page said "Baru". One rule, one place.
 */
export function KosScoreBadge({
  kos,
  size,
  className,
}: {
  kos: Pick<Kos, "score" | "reviews">;
  size?: ScoreBadgeSize;
  className?: string;
}) {
  const isNew = kos.reviews === 0;

  return (
    <ScoreBadge
      score={kos.score}
      size={size}
      accent={isNew ? "ink" : accentForScore(kos.score)}
      label={isNew ? "Baru" : undefined}
      className={className}
    />
  );
}
