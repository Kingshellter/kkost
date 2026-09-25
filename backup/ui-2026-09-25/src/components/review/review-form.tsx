"use client";

import { useRouter } from "next/navigation";
import { useActionState, useRef, useState } from "react";
import { CRITERIA, type FacilityKey } from "@/data/kos";
import { REVIEW_INITIAL, type ReviewState } from "@/lib/action-state";
import { isSupabaseConfigured } from "@/lib/kos-repository";
import { submitReview } from "@/lib/review-actions";
import {
  checkPhotoFile,
  PHOTO_MAX_COUNT,
  PHOTO_TYPES,
  uploadReviewPhotos,
} from "@/lib/review-photo-repository";
import { createClient } from "@/utils/supabase/client";

/**
 * Six 1–5 scales, an optional note, and up to three photos. The average is
 * computed server-side.
 *
 * Photos never go through the Server Action: its body limit is 1 MB, and the
 * Storage policy only accepts files into the folder of a review that already
 * exists. So the action saves the review and returns its id, then the browser
 * uploads the photos straight to Storage under that id.
 */
export function ReviewForm({ kosId }: { kosId: string }) {
  const router = useRouter();
  // See ScoreInput: fields are uncontrolled with a state-backed default, so
  // React 19's post-action form reset restores the note instead of erasing it.
  const [body, setBody] = useState("");
  // Held in state, not in the file input, which the form reset would clear.
  const [files, setFiles] = useState<File[]>([]);
  const [pickError, setPickError] = useState<string | null>(null);
  // The action below reads the selection through a ref: it runs after the
  // render that created it, and must see the files chosen since. Written only
  // from event handlers, through `choose`.
  const filesRef = useRef<File[]>([]);

  function choose(next: File[]) {
    filesRef.current = next;
    setFiles(next);
  }

  async function submitWithPhotos(
    prev: ReviewState,
    formData: FormData,
  ): Promise<ReviewState> {
    const result = await submitReview(prev, formData);
    const chosen = filesRef.current;
    if (!result.ok || !result.reviewId || !chosen.length || !isSupabaseConfigured) {
      return result;
    }

    const photoError = await uploadReviewPhotos(
      createClient(),
      result.reviewId,
      chosen,
    );
    // The action revalidated the page before the photos existed.
    router.refresh();
    return { ...result, photoError };
  }

  const [state, formAction, pending] = useActionState<ReviewState, FormData>(
    submitWithPhotos,
    REVIEW_INITIAL,
  );

  function pick(list: FileList | null) {
    const picked = [...(list ?? [])];
    const invalid = picked.map(checkPhotoFile).find(Boolean) ?? null;
    const valid = picked.filter((file) => !checkPhotoFile(file));
    choose(valid.slice(0, PHOTO_MAX_COUNT));
    setPickError(
      invalid ??
        (valid.length > PHOTO_MAX_COUNT
          ? `Maksimal ${PHOTO_MAX_COUNT} foto — hanya ${PHOTO_MAX_COUNT} yang pertama dipakai.`
          : null),
    );
  }

  if (state.ok) {
    return (
      <div
        role="status"
        className="rounded-[var(--radius-panel)] bg-white p-8 text-center shadow-[var(--shadow-lift)]"
      >
        <p className="text-xl font-extrabold text-ink">Review kamu tersimpan.</p>
        <p className="mt-2 text-[15px] font-medium text-muted">
          Skor kos langsung ikut berubah.
        </p>
        {state.photoError && (
          <p
            role="alert"
            className="mx-auto mt-5 max-w-[46ch] rounded-2xl bg-rose/10 px-4 py-3 text-sm font-bold text-rose"
          >
            Tapi foto gagal diunggah: {state.photoError}
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-[var(--radius-panel)] bg-white p-7 shadow-[var(--shadow-lift)] sm:p-8"
    >
      <input type="hidden" name="kosId" value={kosId} />

      <h2 className="text-[26px] font-extrabold leading-tight text-ink">
        Tulis penilaianmu
      </h2>
      <p className="mt-2 text-[15px] font-medium text-muted">
        Nilai keenam fasilitas dari 1 sampai 5. Skor kos adalah rata-ratanya —
        tanpa bobot.
      </p>

      <div className="mt-7 space-y-6">
        {CRITERIA.map((c) => (
          <ScoreInput key={c.key} name={c.key} label={c.title} />
        ))}
      </div>

      <label className="mt-7 block">
        <span className="text-[15px] font-extrabold text-ink">
          Catatan <span className="font-medium text-muted">(opsional)</span>
        </span>
        <textarea
          name="body"
          defaultValue={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="Apa yang tidak terlihat dari foto iklan?"
          className="mt-2.5 w-full resize-y rounded-[22px] border border-cream-deep bg-cream px-5 py-4 text-[15px] font-medium text-ink outline-none transition-colors placeholder:text-muted focus:border-rose"
        />
      </label>

      <div className="mt-7">
        <label className="block">
          <span className="text-[15px] font-extrabold text-ink">
            Foto{" "}
            <span className="font-medium text-muted">
              (opsional, maks. {PHOTO_MAX_COUNT})
            </span>
          </span>
          <span className="mt-1 block text-sm font-medium text-muted">
            Tunjukkan kamar dan fasilitas yang kamu nilai. JPG, PNG, atau WebP,
            maks. 2 MB per foto. Foto tidak bisa dihapus setelah terkirim —
            jangan memuat wajah atau data pribadi orang lain.
          </span>
          {/* No `name`: the files must not ride along to the Server Action. */}
          <input
            type="file"
            multiple
            accept={Object.keys(PHOTO_TYPES).join(",")}
            onChange={(e) => {
              pick(e.target.files);
              // Lets the same file be picked again after removing it.
              e.target.value = "";
            }}
            className="mt-3 block w-full text-sm font-medium text-muted file:mr-4 file:rounded-full file:border-0 file:bg-cream file:px-5 file:py-3 file:text-[15px] file:font-extrabold file:text-ink hover:file:bg-cream-deep"
          />
        </label>

        {files.length > 0 && (
          <ul className="mt-3 space-y-2">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between gap-3 rounded-2xl bg-cream px-4 py-2.5 text-sm font-bold text-ink"
              >
                <span className="min-w-0 truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => choose(files.filter((_, i) => i !== index))}
                  className="shrink-0 text-muted hover:text-rose"
                >
                  Hapus
                </button>
              </li>
            ))}
          </ul>
        )}

        {pickError && (
          <p role="alert" className="mt-3 text-sm font-bold text-rose">
            {pickError}
          </p>
        )}
      </div>

      {state.error && (
        <p
          role="alert"
          className="mt-5 rounded-2xl bg-rose/10 px-4 py-3 text-sm font-bold text-rose"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-7 w-full rounded-full bg-rose py-4 text-[17px] font-extrabold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {pending
          ? files.length
            ? "Menyimpan review dan foto…"
            : "Menyimpan…"
          : "Kirim review"}
      </button>
    </form>
  );
}

/**
 * Radio group styled as five pills — keyboard-navigable, no JS needed to submit.
 *
 * `defaultChecked`, not `checked`: React 19 resets the form after the action
 * settles, and a controlled radio would come back unchecked in the DOM while
 * its pill still looked selected — `required` then blocked the resubmit.
 * Tying the default to state makes the reset land on the user's choice.
 */
function ScoreInput({ name, label }: { name: FacilityKey; label: string }) {
  const [value, setValue] = useState(0);

  return (
    <fieldset>
      <div className="flex items-baseline justify-between gap-4">
        <legend className="text-[15px] font-extrabold text-ink">{label}</legend>
        <span className="text-sm font-bold tabular-nums text-muted">
          {value ? `${value} / 5` : "belum dinilai"}
        </span>
      </div>

      <div className="mt-3 flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <label
            key={n}
            className={`flex-1 cursor-pointer rounded-full py-3 text-center text-[15px] font-extrabold transition-colors ${
              value === n
                ? "bg-rose text-white"
                : "bg-cream text-ink hover:bg-cream-deep"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={n}
              required
              defaultChecked={value === n}
              onChange={() => setValue(n)}
              className="sr-only"
            />
            {n}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
