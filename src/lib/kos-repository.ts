import type { SupabaseClient } from "@supabase/supabase-js";
import { KOS_LIST, type Accent, type Kos } from "@/data/kos";

export type NewKosInput = {
  name: string;
  area: string;
  city: string;
  campus: string | null;
  price: number;
  /** Metres to `campus`. Typed in by the user — kkost has no single origin. */
  distance: number;
  lat: number;
  lng: number;
};

export type SaveResult =
  | { status: "saved"; id: string }
  | { status: "unconfigured" }
  | { status: "error"; message: string };

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

/**
 * ─── THE ONLY PLACE THAT KNOWS THE `kos` COLUMN NAMES ───
 *
 * One repository per table (see also review-repository.ts). Every function
 * takes the Supabase client as an argument so the same query runs from a
 * Server Component and from the browser.
 *
 * Requires supabase/migrations/0001_kos_location_fields.sql. Until it runs,
 * writes fail with PGRST204 and reads come back missing columns — both handled.
 */

const SELECT =
  "id, name, area, city, campus, price, distance_m, lat, lng, score, reviews";

type Row = {
  id: string;
  name: string;
  area: string | null;
  city: string | null;
  campus: string | null;
  price: number | null;
  distance_m: number | null;
  lat: number | null;
  lng: number | null;
  score: number | string | null;
  reviews: number | null;
};

const PHOTO_ACCENTS = ["amber", "sky", "rose", "blue"] as const satisfies Accent[];

/**
 * Picks the picture accent from the id, not the list position: the same kos
 * must look the same on its card, in the hero and on its own detail page,
 * where it is fetched alone.
 */
function photoAccentFor(id: string): Accent {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return PHOTO_ACCENTS[Math.abs(hash) % PHOTO_ACCENTS.length];
}

export function toKosRow(input: NewKosInput) {
  return {
    name: input.name,
    area: input.area,
    city: input.city,
    campus: input.campus,
    price: input.price,
    distance_m: input.distance,
    lat: input.lat,
    lng: input.lng,
  };
}

function fromRow(row: Row): Kos {
  const id = String(row.id);
  return {
    id,
    name: row.name,
    area: row.area ?? "—",
    city: row.city ?? "—",
    campus: row.campus,
    distance: row.distance_m ?? 0,
    price: row.price ?? 0,
    score: Number(row.score ?? 0),
    reviews: row.reviews ?? 0,
    photoAccent: photoAccentFor(id),
    coords: [row.lat ?? 0, row.lng ?? 0],
    highlights: [],
  };
}

/**
 * Legacy rows predate the location migration and have no coordinates, so they
 * would all pile up at [0, 0] in the Gulf of Guinea. Keep them out of the map.
 */
function hasCoords(row: Row) {
  return row.lat !== null && row.lng !== null;
}

/**
 * Where a kos list came from. Only "demo" ever shows the hardcoded `KOS_LIST`,
 * and only on a checkout with no Supabase credentials.
 *
 * "unavailable" is deliberately an empty list, not the demo list: `KOS_LIST`
 * carries invented scores, and showing them while the real database is down
 * would present made-up numbers as tenant reviews — the one thing kkost exists
 * to prevent.
 */
export type KosSource = "database" | "demo" | "unavailable";

export type KosListResult = { kos: Kos[]; source: KosSource };

export async function fetchKosList(
  supabase: SupabaseClient | null,
): Promise<KosListResult> {
  if (!supabase || !isSupabaseConfigured) {
    return { kos: KOS_LIST, source: "demo" };
  }

  const { data, error } = await supabase
    .from("kos")
    .select(SELECT)
    .order("score", { ascending: false });

  if (error || !data) return { kos: [], source: "unavailable" };
  // An empty table is a real, honest state — not a reason to show demo data.
  return {
    kos: (data as Row[]).filter(hasCoords).map((row) => fromRow(row)),
    source: "database",
  };
}

/** Postgres rejects a non-uuid id with this code; that is a 404, not an outage. */
const INVALID_UUID = "22P02";

/**
 * Resolves the demo slugs only when Supabase is not configured — otherwise
 * every card on a bare checkout would link to a 404.
 *
 * With Supabase configured, a database failure throws instead of falling back:
 * the demo kos carry invented scores, and a detail page is not allowed to pass
 * them off as real. The error surfaces through Next's error boundary.
 */
export async function fetchKos(
  supabase: SupabaseClient | null,
  id: string,
): Promise<Kos | null> {
  if (!supabase || !isSupabaseConfigured) {
    return KOS_LIST.find((kos) => kos.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from("kos")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error?.code === INVALID_UUID) return null;
  if (error) throw new Error(`Gagal memuat kos: ${error.message}`);
  return data ? fromRow(data as Row) : null;
}

export async function saveKos(
  supabase: SupabaseClient | null,
  input: NewKosInput,
): Promise<SaveResult> {
  if (!supabase || !isSupabaseConfigured) return { status: "unconfigured" };

  try {
    const { data, error } = await supabase
      .from("kos")
      .insert(toKosRow(input))
      .select("id")
      .single();

    if (error) return { status: "error", message: explain(error) };
    return { status: "saved", id: String(data.id) };
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : "Gagal menyimpan kos",
    };
  }
}

type Postgrestish = { code?: string; message: string };

/** Turn the failures we actually expect into something actionable. */
function explain(error: Postgrestish) {
  // Migration has not been applied yet
  if (error.code === "PGRST204" || /column .* of 'kos'/.test(error.message)) {
    return "Kolom belum ada di tabel kos. Jalankan migrasi di supabase/migrations/ secara berurutan lewat SQL Editor.";
  }
  // A CHECK constraint from 0008 rejected a value the form should have caught
  // — someone bypassed it, or the two limits have drifted apart.
  if (error.code === "23514") {
    return error.message.includes("kos_in_indonesia")
      ? "Titik ini di luar Indonesia. kkost hanya mencakup kos di Indonesia."
      : "Data kos di luar batas yang diizinkan. Periksa panjang teks, harga, dan jarak.";
  }
  // Row Level Security rejected the write. Since 0004 only authenticated users
  // may insert, so this is almost always a missing session — the UI gates the
  // form too, but the policy is the actual boundary.
  if (error.code === "42501" || /row-level security/i.test(error.message)) {
    return "Ditolak: menambah kos harus masuk dulu.";
  }
  return error.message;
}

/**
 * Turn form input into the shape the map and cards already render.
 *
 * Pass the database `id` when the row was saved, so the card links to a real
 * `/kos/[id]` page and the server list can replace the optimistic copy; the
 * `local-` id is only for kos that never reached Supabase.
 */
export function toKos(
  input: NewKosInput,
  id = `local-${Date.now()}`,
): Kos {
  return {
    id,
    name: input.name,
    area: input.area,
    city: input.city,
    campus: input.campus,
    distance: input.distance,
    price: input.price,
    score: 0,
    reviews: 0,
    photoAccent: photoAccentFor(id),
    coords: [input.lat, input.lng],
    highlights: [],
  };
}
