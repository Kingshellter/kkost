import { z } from "zod";
import type { Kos } from "@/data/kos";

/**
 * Filtering and sorting for the landing page, driven entirely by the URL:
 * `/?kota=Semarang&harga=1000000&urut=harga#browse`. URL state means a filtered
 * list can be shared, survives a refresh, and works with JavaScript off — the
 * forms that set it are plain GET forms.
 *
 * The list is filtered in memory rather than in the query: the hero stats and
 * the city dropdown need the unfiltered list anyway, and kkost is nowhere near
 * the size where a second round trip would beat a loop.
 */

export const SORTS = [
  { value: "skor", label: "Skor tertinggi" },
  { value: "harga", label: "Harga termurah" },
  { value: "jarak", label: "Terdekat ke kampus" },
] as const;

export type SortKey = (typeof SORTS)[number]["value"];

/** Budget ceilings offered by both the hero search and the browse filter. */
export const BUDGETS = [750_000, 1_000_000, 1_500_000, 2_000_000] as const;

export type KosFilter = {
  city: string | null;
  maxPrice: number | null;
  sort: SortKey;
};

type RawParams = Record<string, string | string[] | undefined>;

// `.catch` instead of failing the parse: a stale or hand-edited URL should
// fall back to "no filter", never to an error page.
const schema = z.object({
  kota: z.string().trim().min(1).max(80).optional().catch(undefined),
  harga: z.coerce.number().int().positive().optional().catch(undefined),
  urut: z
    .enum(["skor", "harga", "jarak"] satisfies SortKey[])
    .catch("skor"),
});

export function parseKosFilter(params: RawParams): KosFilter {
  const first = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const parsed = schema.parse({
    kota: first("kota"),
    harga: first("harga"),
    urut: first("urut"),
  });

  return {
    city: parsed.kota ?? null,
    maxPrice: parsed.harga ?? null,
    sort: parsed.urut,
  };
}

/** True when the filter removes kos from the list, not merely reorders it. */
export function isNarrowed(filter: KosFilter) {
  return filter.city !== null || filter.maxPrice !== null;
}

/** True when anything differs from the default view — shows the reset link. */
export function hasFilter(filter: KosFilter) {
  return isNarrowed(filter) || filter.sort !== "skor";
}

const collator = new Intl.Collator("id-ID", { sensitivity: "base" });

/** A kos with no campus, or no measured distance to it, sorts last. */
function distanceRank(kos: Kos) {
  return kos.campus && kos.distance !== null
    ? kos.distance
    : Number.MAX_SAFE_INTEGER;
}

const COMPARE: Record<SortKey, (a: Kos, b: Kos) => number> = {
  // Unreviewed kos score 0, so they sink below every reviewed one.
  skor: (a, b) => b.score - a.score || b.reviews - a.reviews,
  harga: (a, b) => a.price - b.price,
  jarak: (a, b) => distanceRank(a) - distanceRank(b),
};

/**
 * The filter's predicate on its own. The map applies it to kos added this
 * session too, which never pass through `applyKosFilter` on the server.
 */
export function matchesKosFilter(kos: Kos, filter: KosFilter) {
  return (
    (filter.city === null || collator.compare(kos.city, filter.city) === 0) &&
    (filter.maxPrice === null || kos.price <= filter.maxPrice)
  );
}

export function applyKosFilter(list: Kos[], filter: KosFilter): Kos[] {
  return list
    .filter((kos) => matchesKosFilter(kos, filter))
    .sort(COMPARE[filter.sort]);
}

/** Every city that has at least one kos, alphabetically. */
export function cityOptions(list: Kos[]) {
  const cities = new Set(
    list.map((kos) => kos.city).filter((city) => city !== "—"),
  );
  return [...cities].sort(collator.compare);
}

/**
 * The hero's headline numbers, counted from the data on the page. They used to
 * be hardcoded, which on a site whose argument is trustworthiness was the one
 * claim nothing enforced.
 */
export function summarizeKos(list: Kos[]) {
  return {
    kos: list.length,
    cities: cityOptions(list).length,
    reviews: list.reduce((sum, kos) => sum + kos.reviews, 0),
  };
}
