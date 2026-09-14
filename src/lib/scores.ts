import type { FacilityKey, Review } from "@/data/kos";

/**
 * Mean of one facility across a set of reviews, to one decimal — the same
 * rounding the database applies to `reviews.average`. 0 for an empty list.
 *
 * Display only. `kos.score` itself is never computed here; see
 * refresh_kos_score() in the migrations.
 */
export function averageFor(
  reviews: Pick<Review, "scores">[],
  key: FacilityKey,
) {
  if (!reviews.length) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.scores[key], 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}
