import type { SupabaseClient } from "@supabase/supabase-js";
import {
  FACILITY_KEYS,
  type FacilityKey,
  type Review,
} from "@/data/kos";
import {
  photoUrls,
  REVIEW_PHOTOS_EMBED,
  type PhotoRow,
} from "@/lib/review-photo-repository";

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

const COLUMNS = `id, kos_id, author_id, average, body, created_at,
  ${FACILITY_KEYS.join(", ")}`;

/** The columns a Review is built from, including the joined author profile. */
const SELECT_BEFORE_0010 = `${COLUMNS}, profiles ( display_name, is_student, is_demo )`;

/** Plus the attached photos (0010). */
const SELECT = `${SELECT_BEFORE_0010}, ${REVIEW_PHOTOS_EMBED}`;

/**
 * The same minus `is_demo`, for a database that has not run
 * 0007_demo_profiles.sql yet — without it the missing column would make every
 * review silently disappear instead of merely losing its demo label.
 */
const SELECT_BEFORE_0007 = `${COLUMNS}, profiles ( display_name, is_student )`;

type Row = {
  id: string;
  kos_id: string;
  author_id: string;
  average: number | string;
  body: string | null;
  created_at: string;
  profiles: {
    display_name: string | null;
    is_student: boolean;
    is_demo?: boolean;
  } | null;
  /** Absent when an older SELECT was used. */
  review_photos?: PhotoRow[] | null;
} & Record<FacilityKey, number>;

function toReview(row: Row, supabase: SupabaseClient): Review {
  return {
    id: row.id,
    kosId: row.kos_id,
    authorId: row.author_id,
    authorName: row.profiles?.display_name ?? "Anonim",
    isStudent: row.profiles?.is_student ?? false,
    isDemo: row.profiles?.is_demo ?? false,
    scores: Object.fromEntries(
      FACILITY_KEYS.map((k) => [k, row[k]]),
    ) as Record<FacilityKey, number>,
    average: Number(row.average),
    body: row.body,
    photos: photoUrls(supabase, row.review_photos),
    createdAt: row.created_at,
  };
}

export async function fetchReviews(
  supabase: SupabaseClient,
  kosId: string,
): Promise<Review[]> {
  const query = (select: string) =>
    supabase
      .from("reviews")
      .select(select)
      .eq("kos_id", kosId)
      .order("created_at", { ascending: false });

  // Each fallback drops what a later migration added, so a database behind on
  // migrations loses photos or demo labels — never the reviews themselves.
  let { data, error } = await query(SELECT);
  if (error) ({ data, error } = await query(SELECT_BEFORE_0010));
  if (error) ({ data, error } = await query(SELECT_BEFORE_0007));

  if (error || !data) return [];
  return (data as unknown as Row[]).map((row) => toReview(row, supabase));
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
