"use client";

import { createClient } from "@/utils/supabase/client";
import type { Kos } from "@/data/kos";

export type NewKosInput = {
  name: string;
  area: string;
  price: number;
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
 * ─── THE ONLY PLACE THAT KNOWS THE DATABASE COLUMN NAMES ───
 *
 * Verified against the live project: `kos` ships with only id/name/created_at,
 * so the remaining columns come from supabase/migrations/0001_kos_location_fields.sql.
 * Until that migration runs, inserts fail with PGRST204 (handled below).
 */
export function toKosRow(input: NewKosInput) {
  return {
    name: input.name,
    area: input.area,
    price: input.price,
    distance_m: input.distance,
    lat: input.lat,
    lng: input.lng,
  };
}

export async function saveKos(input: NewKosInput): Promise<SaveResult> {
  if (!isSupabaseConfigured) return { status: "unconfigured" };

  try {
    const supabase = createClient();
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

/** Turn the two failures we actually expect into something actionable. */
function explain(error: Postgrestish) {
  // Migration has not been applied yet
  if (error.code === "PGRST204" || /column .* of 'kos'/.test(error.message)) {
    return "Kolom belum ada di tabel kos. Jalankan supabase/migrations/0001_kos_location_fields.sql di SQL Editor.";
  }
  // Row Level Security rejected the write
  if (error.code === "42501" || /row-level security/i.test(error.message)) {
    return "Ditolak RLS: tabel kos belum punya policy INSERT untuk role ini.";
  }
  return error.message;
}

const PHOTO_ACCENTS = ["amber", "sky", "rose", "blue"] as const;

/** Turn form input into the shape the map and cards already render. */
export function toKos(input: NewKosInput, index: number): Kos {
  return {
    id: `local-${Date.now()}`,
    name: input.name,
    area: input.area,
    distance: input.distance,
    price: input.price,
    score: 0,
    reviews: 0,
    photoAccent: PHOTO_ACCENTS[index % PHOTO_ACCENTS.length],
    coords: [input.lat, input.lng],
    highlights: [],
  };
}
