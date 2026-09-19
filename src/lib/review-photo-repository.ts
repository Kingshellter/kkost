import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * ─── THE ONLY PLACE THAT KNOWS THE `review_photos` COLUMNS AND THE BUCKET ───
 *
 * Requires supabase/migrations/0010_review_photos.sql. The limits below mirror
 * the bucket's `file_size_limit` / `allowed_mime_types` and the three-photo
 * trigger; the database is the real boundary, these only fail faster.
 */

export const REVIEW_PHOTO_BUCKET = "review-photos";

export const PHOTO_MAX_BYTES = 2 * 1024 * 1024;

export const PHOTO_MAX_COUNT = 3;

export const PHOTO_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

type PhotoType = keyof typeof PHOTO_TYPES;

/** The embed `fetchReviews` adds to its select, oldest photo first. */
export const REVIEW_PHOTOS_EMBED = "review_photos ( path, created_at )";

export type PhotoRow = { path: string; created_at: string };

function isPhotoType(type: string): type is PhotoType {
  return type in PHOTO_TYPES;
}

/** Checks one file against the bucket limits, in Indonesian. Null when it passes. */
export function checkPhotoFile(file: File): string | null {
  if (!isPhotoType(file.type)) return "Foto harus berformat JPG, PNG, atau WebP.";
  if (file.size > PHOTO_MAX_BYTES) return "Ukuran setiap foto maksimal 2 MB.";
  return null;
}

/** Public URLs for a review's embedded photo rows, oldest first. */
export function photoUrls(
  supabase: SupabaseClient,
  rows: PhotoRow[] | null | undefined,
): string[] {
  return [...(rows ?? [])]
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .slice(0, PHOTO_MAX_COUNT)
    .map(
      (row) =>
        supabase.storage.from(REVIEW_PHOTO_BUCKET).getPublicUrl(row.path).data
          .publicUrl,
    );
}

/**
 * Attach photos to a review the current user wrote. Runs in the browser, after
 * the review itself is saved — the Storage policy only accepts uploads into
 * the folder of a review the uploader authored, so the review must exist.
 *
 * Per file, two steps in this order: the object into Storage, then a
 * `review_photos` row pointing at it (the row's trigger checks the object
 * exists and belongs to the same account). A row that fails leaves its object
 * orphaned — never shown, because only rows are.
 *
 * Returns null on success, or an Indonesian message for the first failure.
 */
export async function uploadReviewPhotos(
  supabase: SupabaseClient,
  reviewId: string,
  files: File[],
): Promise<string | null> {
  for (const file of files.slice(0, PHOTO_MAX_COUNT)) {
    const invalid = checkPhotoFile(file);
    if (invalid) return invalid;

    const ext = PHOTO_TYPES[file.type as PhotoType];
    const path = `${reviewId}/${crypto.randomUUID()}.${ext}`;

    const upload = await supabase.storage
      .from(REVIEW_PHOTO_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });
    if (upload.error) return explain(upload.error.message);

    const { error } = await supabase
      .from("review_photos")
      .insert({ review_id: reviewId, path });
    if (error) return explain(error.message);
  }
  return null;
}

function explain(message: string) {
  if (
    /bucket not found/i.test(message) ||
    /review_photos.*(does not exist|could not find)|could not find the table/i.test(
      message,
    )
  ) {
    return "Fitur foto belum aktif. Jalankan supabase/migrations/0010_review_photos.sql lewat SQL Editor.";
  }
  if (/maksimal 3 foto/i.test(message)) return "Satu review maksimal 3 foto.";
  if (/row-level security|unauthorized|403/i.test(message)) {
    return "Ditolak: foto hanya bisa ditambahkan ke review milikmu sendiri.";
  }
  if (/size|too large|413/i.test(message)) return "Ukuran setiap foto maksimal 2 MB.";
  if (/mime|type/i.test(message)) {
    return "Foto harus berformat JPG, PNG, atau WebP.";
  }
  return message;
}
