"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { FacilityKey } from "@/data/kos";
import { type ReviewState } from "@/lib/action-state";
import { getSessionUser } from "@/lib/auth";
import { saveReview } from "@/lib/review-repository";
import { createClient } from "@/utils/supabase/server";

const score = z.coerce
  .number()
  .int()
  .min(1, "Setiap fasilitas harus dinilai 1–5")
  .max(5, "Setiap fasilitas harus dinilai 1–5");

// Written out rather than built from FACILITY_KEYS so zod can infer the shape;
// the `satisfies` below still fails the build if the two ever drift apart.
const schema = z.object({
  kosId: z.uuid("Kos tidak dikenali"),
  body: z.string().trim().max(2000, "Ulasan maksimal 2000 karakter"),
  room: score,
  bathroom: score,
  water: score,
  wifi: score,
  kitchen: score,
  parking: score,
});

export async function submitReview(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  // The form supplies which kos and the user's scores; the author is read from
  // the session, never from the request body.
  const user = await getSessionUser();
  if (!user) {
    return { error: "Kamu harus masuk dulu untuk menulis review.", ok: false };
  }

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, ok: false };
  }

  const { kosId, body, ...scores } = parsed.data;
  scores satisfies Record<FacilityKey, number>;

  const supabase = await createClient();
  const result = await saveReview(supabase, {
    kosId,
    authorId: user.id,
    scores,
    body: body || null,
  });

  if (result.status === "duplicate") {
    return { error: "Kamu sudah menulis review untuk kos ini.", ok: false };
  }
  if (result.status === "error") {
    return { error: result.message, ok: false };
  }

  // kos.score / kos.reviews are recomputed by a database trigger, so both the
  // detail page and the landing page need refreshing.
  revalidatePath(`/kos/${kosId}`);
  revalidatePath("/");
  return { error: null, ok: true };
}
