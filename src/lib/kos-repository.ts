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

function fromRow(row: Row, index: number): Kos {
  return {
    id: String(row.id),
    name: row.name,
    area: row.area ?? "—",
    city: row.city ?? "—",
    campus: row.campus,
    distance: row.distance_m ?? 0,
    price: row.price ?? 0,
    score: Number(row.score ?? 0),
    reviews: row.reviews ?? 0,
    photoAccent: PHOTO_ACCENTS[index % PHOTO_ACCENTS.length],
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

/** Falls back to the demo list so the page still renders on a bare checkout. */
export async function fetchKosList(
  supabase: SupabaseClient | null,
): Promise<Kos[]> {
  if (!supabase || !isSupabaseConfigured) return KOS_LIST;

  const { data, error } = await supabase
    .from("kos")
    .select(SELECT)
    .order("score", { ascending: false });

  if (error || !data?.length) return KOS_LIST;
  return (data as Row[]).filter(hasCoords).map(fromRow);
}

/**
 * Falls back to the demo list, like fetchKosList — otherwise every card on a
 * bare checkout links to a 404, because the demo ids are slugs rather than the
 * uuids the database hands out.
 */
export async function fetchKos(
  supabase: SupabaseClient | null,
  id: string,
): Promise<Kos | null> {
  const fallback = () => KOS_LIST.find((kos) => kos.id === id) ?? null;
  if (!supabase || !isSupabaseConfigured) return fallback();

  const { data, error } = await supabase
    .from("kos")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return fallback();
  return fromRow(data as Row, 0);
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
  // Row Level Security rejected the write. Since 0004 only authenticated users
  // may insert, so this is almost always a missing session — the UI gates the
  // form too, but the policy is the actual boundary.
  if (error.code === "42501" || /row-level security/i.test(error.message)) {
    return "Ditolak: menambah kos harus masuk dulu.";
  }
  return error.message;
}

/** Turn form input into the shape the map and cards already render. */
export function toKos(input: NewKosInput, index: number): Kos {
  return {
    id: `local-${Date.now()}`,
    name: input.name,
    area: input.area,
    city: input.city,
    campus: input.campus,
    distance: input.distance,
    price: input.price,
    score: 0,
    reviews: 0,
    photoAccent: PHOTO_ACCENTS[index % PHOTO_ACCENTS.length],
    coords: [input.lat, input.lng],
    highlights: [],
  };
}
