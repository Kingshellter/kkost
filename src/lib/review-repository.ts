import type { SupabaseClient } from "@supabase/supabase-js";
import {
  FACILITY_KEYS,
  type FacilityKey,
  type Review,
} from "@/data/kos";

/**
 * ─── THE ONLY PLACE THAT KNOWS THE `reviews` COLUMN NAMES ───
 *
 * Mirrors the rule in kos-repository.ts, one file per table. Functions here
 * take the Supabase client as an argument so the same query runs from a Server
 * Component (utils/supabase/server) and from the browser (utils/supabase/client).
 *
 * Requires supabase/migrations/0002_reviews.sql.
 */

export type NewReviewInput = {
  kosId: string;
  authorId: string;
  scores: Record<FacilityKey, number>;
  body: string | null;
};

export type ReviewResult =
  | { status: "saved"; id: string }
  | { status: "duplicate" }
  | { status: "error"; message: string };

/** The columns a Review is built from, including the joined author profile. */
const SELECT = `id, kos_id, average, body, created_at,
  ${FACILITY_KEYS.join(", ")},
  profiles ( display_name, is_student )` as const;

type Row = {
  id: string;
  kos_id: string;
  average: number | string;
  body: string | null;
  created_at: string;
  profiles: { display_name: string | null; is_student: boolean } | null;
} & Record<FacilityKey, number>;

function toReview(row: Row): Review {
  return {
    id: row.id,
    kosId: row.kos_id,
    authorName: row.profiles?.display_name ?? "Anonim",
    isStudent: row.profiles?.is_student ?? false,
    scores: Object.fromEntries(
      FACILITY_KEYS.map((k) => [k, row[k]]),
    ) as Record<FacilityKey, number>,
    average: Number(row.average),
    body: row.body,
    createdAt: row.created_at,
  };
}

export async function fetchReviews(
  supabase: SupabaseClient,
  kosId: string,
): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select(SELECT)
    .eq("kos_id", kosId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as unknown as Row[]).map(toReview);
}

export async function saveReview(
  supabase: SupabaseClient,
  input: NewReviewInput,
): Promise<ReviewResult> {
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      kos_id: input.kosId,
      author_id: input.authorId,
      body: input.body,
      ...input.scores,
    })
    .select("id")
    .single();

  if (error) {
    // unique (kos_id, author_id) — one review per kos, per tenancy
    if (error.code === "23505") return { status: "duplicate" };
    if (error.code === "42P01") {
      return {
        status: "error",
        message:
          "Tabel reviews belum ada. Jalankan supabase/migrations/0002_reviews.sql di SQL Editor.",
      };
    }
    if (error.code === "42501" || /row-level security/i.test(error.message)) {
      return {
        status: "error",
        message: "Ditolak RLS. Pastikan kamu sudah login sebelum menulis review.",
      };
    }
    return { status: "error", message: error.message };
  }

  return { status: "saved", id: String(data.id) };
}
