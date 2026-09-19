import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, PHOTO_BUCKET } from "@/lib/kos-repository";

/**
 * ─── THE ONLY PLACE THAT KNOWS THE `kos_photos` COLUMN NAMES ───
 *
 * Requires supabase/migrations/0009_kos_photos.sql. The limits below mirror
 * the bucket's own `file_size_limit` and `allowed_mime_types`; Storage is the
 * real boundary, this only gives the error before the upload.
 */

export const PHOTO_MAX_BYTES = 2 * 1024 * 1024;

export const PHOTO_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

type PhotoType = keyof typeof PHOTO_TYPES;

export type PhotoUploadResult =
  | { status: "saved" }
  | { status: "unconfigured" }
  | { status: "error"; message: string };

function isPhotoType(type: string): type is PhotoType {
  return type in PHOTO_TYPES;
}

/** Checks a file against the bucket limits, in Indonesian. Null when it passes. */
export function checkPhotoFile(file: File): string | null {
  if (!isPhotoType(file.type)) return "Foto harus berformat JPG, PNG, atau WebP.";
  if (file.size > PHOTO_MAX_BYTES) return "Ukuran foto maksimal 2 MB.";
  return null;
}

/**
 * Two steps, in this order: the file into Storage, then a `kos_photos` row
 * pointing at it. The row's trigger checks the object exists and belongs to
 * the same account, so the order is not optional.
 *
 * If the row insert fails the object stays orphaned in the bucket — no client
 * role may delete from it, by design. It is never shown, because only rows in
 * `kos_photos` are.
 */
export async function uploadKosPhoto(
  supabase: SupabaseClient | null,
  kosId: string,
  file: File,
): Promise<PhotoUploadResult> {
  if (!supabase || !isSupabaseConfigured) return { status: "unconfigured" };

  const invalid = checkPhotoFile(file);
  if (invalid) return { status: "error", message: invalid };

  const ext = PHOTO_TYPES[file.type as PhotoType];
  const path = `${kosId}/${crypto.randomUUID()}.${ext}`;

  const upload = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (upload.error) {
    return { status: "error", message: explain(upload.error.message) };
  }

  const { error } = await supabase
    .from("kos_photos")
    .insert({ kos_id: kosId, path });
  if (error) return { status: "error", message: explain(error.message) };

  return { status: "saved" };
}

function explain(message: string) {
  if (
    /bucket not found/i.test(message) ||
    /kos_photos.*(does not exist|could not find)|could not find the table/i.test(
      message,
    )
  ) {
    return "Fitur foto belum aktif. Jalankan supabase/migrations/0009_kos_photos.sql lewat SQL Editor.";
  }
  if (/row-level security|unauthorized|403/i.test(message)) {
    return "Ditolak: mengunggah foto harus masuk dulu.";
  }
  if (/size|too large|413/i.test(message)) return "Ukuran foto maksimal 2 MB.";
  if (/mime|type/i.test(message)) {
    return "Foto harus berformat JPG, PNG, atau WebP.";
  }
  return message;
}
