"use client";

import { CircleCheck, ImagePlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import {
  buttonClass,
  LABEL_CLASS,
  NOTICE_CLASS,
  TEXTAREA_CLASS,
} from "@/components/ui/controls";
import { CRITERION_ICON } from "@/components/ui/criterion-icon";
import { Spinner } from "@/components/ui/spinner";
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
 *
 * This component also owns the "already reviewed" card. The action
 * revalidates the page, which re-renders it with `alreadyReviewed` true; if
 * the page swapped this component for that card, it would unmount mid-submit
 * and the success message (and any photo error) would never show. Staying
 * mounted keeps `state.ok`, which wins over `alreadyReviewed`.
 */
export function ReviewForm({
  kosId,
  alreadyReviewed = false,
}: {
  kosId: string;
  alreadyReviewed?: boolean;
}) {
  const router = useRouter();
  const [scores, setScores] = useState<Partial<Record<FacilityKey, number>>>(
    {},
  );
  // Fields are uncontrolled with a state-backed default, so React 19's
  // post-action form reset restores the note instead of erasing it.
  const [body, setBody] = useState("");
  // Held in state, not in the file input, which the form reset would clear.
  // Each photo's preview URL is made when it is picked and revoked when it
  // is removed, so no effect has to chase the list.
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [pickError, setPickError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  // The action below reads the selection through a ref: it runs after the
  // render that created it, and must see the files chosen since. Written only
  // from event handlers, through `choose`.
  const photosRef = useRef<Photo[]>([]);

  function choose(next: Photo[]) {
    photosRef.current = next;
    setPhotos(next);
  }

  // Revoke whatever is still previewed when the form goes away.
  useEffect(
    () => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.url)),
    [],
  );

  async function submitWithPhotos(
    prev: ReviewState,
    formData: FormData,
  ): Promise<ReviewState> {
    const result = await submitReview(prev, formData);
    const chosen = photosRef.current.map((p) => p.file);
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
    const room = PHOTO_MAX_COUNT - photos.length;
    const added = valid
      .slice(0, room)
      .map((file) => ({ file, url: URL.createObjectURL(file) }));
    choose([...photos, ...added]);
    setPickError(
      invalid ??
        (valid.length > room
          ? `Maksimal ${PHOTO_MAX_COUNT} foto. Sisanya tidak ditambahkan.`
          : null),
    );
  }

  if (state.ok) return <SavedCard photoError={state.photoError} />;

  if (alreadyReviewed) {
    return (
      <div className="rounded-panel bg-white p-8 text-center shadow-lift">
        <p className="text-xl font-extrabold text-ink">
          Kamu sudah menilai kos ini
        </p>
        <p className="mx-auto mt-2 max-w-[42ch] text-base font-medium text-muted">
          Satu review per kos, per masa sewa.
        </p>
      </div>
    );
  }

  const values = Object.values(scores);
  const rated = values.length;
  const average = rated
    ? values.reduce((sum, v) => sum + v, 0) / rated
    : null;

  // noValidate + this check instead of the radios' `required` bubble, which
  // speaks the browser's language and points at one radio of thirty.
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    const unrated = CRITERIA.find((c) => !scores[c.key]);
    if (!unrated) return;
    e.preventDefault();
    setMissing(true);
    e.currentTarget
      .querySelector<HTMLInputElement>(`input[name="${unrated.key}"]`)
      ?.focus();
  }

  return (
    <form
      action={formAction}
      onSubmit={onSubmit}
      noValidate
      className="rounded-panel bg-white p-5 shadow-lift sm:p-8"
    >
      <input type="hidden" name="kosId" value={kosId} />

      <h2 className="text-2xl font-extrabold leading-tight text-ink">
        Tulis penilaianmu
      </h2>
      <p className="mt-2 text-base font-medium text-muted">
        Nilai keenam fasilitas dari 1 sampai 5. Skor kos adalah rata-rata
        polosnya, tanpa bobot.
      </p>

      <Progress rated={rated} average={average} />

      <div className="mt-7 space-y-6">
        {CRITERIA.map((c, i) => (
          <ScoreInput
            key={c.key}
            name={c.key}
            label={c.title}
            value={scores[c.key] ?? 0}
            onChange={(n) => setScores((s) => ({ ...s, [c.key]: n }))}
            showScale={i === 0}
          />
        ))}
      </div>

      <label className="mt-8 block">
        <span className={LABEL_CLASS}>
          Catatan <span className="font-medium text-muted">(opsional)</span>
        </span>
        <textarea
          name="body"
          defaultValue={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="Apa yang tidak terlihat dari foto iklan?"
          className={TEXTAREA_CLASS}
        />
      </label>

      <PhotoPicker
        photos={photos}
        onPick={pick}
        onRemove={(index) => {
          URL.revokeObjectURL(photos[index].url);
          choose(photos.filter((_, i) => i !== index));
          setPickError(null);
        }}
        error={pickError}
      />

      {missing && rated < CRITERIA.length && (
        <p role="alert" className={`mt-5 ${NOTICE_CLASS.error}`}>
          Masih ada {CRITERIA.length - rated} fasilitas yang belum dinilai.
        </p>
      )}

      {state.error && (
        <p role="alert" className={`mt-5 ${NOTICE_CLASS.error}`}>
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className={buttonClass("primary", "lg", "mt-7 w-full")}
      >
        {pending && <Spinner />}
        {pending
          ? photos.length
            ? "Menyimpan review dan foto…"
            : "Menyimpan…"
          : "Kirim review"}
      </button>
    </form>
  );
}

/**
 * How many of the six are scored, and the average so far — the same plain
 * mean the database will compute, so the number the kos gets is no surprise.
 * The bar fills with `scale-x`, not width, so it never moves layout.
 */
function Progress({
  rated,
  average,
}: {
  rated: number;
  average: number | null;
}) {
  const total = CRITERIA.length;
  return (
    <div className="mt-5 rounded-box bg-cream px-4 py-3">
      <div className="flex items-baseline justify-between gap-4 text-sm font-medium text-ink-soft">
        <p aria-live="polite">
          <strong className="font-extrabold tabular-nums text-ink">
            {rated}
          </strong>{" "}
          dari {total} dinilai
        </p>
        <p>
          {average === null ? (
            "Rata-rata muncul di sini"
          ) : (
            <>
              Rata-rata{" "}
              <strong className="font-extrabold tabular-nums text-ink">
                {average.toFixed(1)}
              </strong>
            </>
          )}
        </p>
      </div>
      <div aria-hidden className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white">
        <div
          className="h-full origin-left rounded-full bg-action transition-transform duration-(--duration-base) ease-out"
          style={{ transform: `scaleX(${rated / total})` }}
        />
      </div>
    </div>
  );
}

/**
 * Radio group styled as five pills, keyboard-navigable.
 *
 * `defaultChecked`, not `checked`: React 19 resets the form after the action
 * settles, and a controlled radio would come back unchecked in the DOM while
 * its pill still looked selected, so the resubmit sent no score. Tying the
 * default to state makes the reset land on the user's choice.
 */
function ScoreInput({
  name,
  label,
  value,
  onChange,
  showScale,
}: {
  name: FacilityKey;
  label: string;
  value: number;
  onChange: (value: number) => void;
  /** The "Buruk … Sangat baik" legend, once for the whole form. */
  showScale: boolean;
}) {
  const Icon = CRITERION_ICON[name];

  return (
    <fieldset>
      <div className="flex items-center justify-between gap-4">
        <legend className={`${LABEL_CLASS} flex items-center gap-2`}>
          <Icon aria-hidden className="size-5 text-muted" strokeWidth={2} />
          {label}
        </legend>
        <span className="text-sm font-bold tabular-nums text-muted">
          {value ? `${value} / 5` : "belum dinilai"}
        </span>
      </div>

      <div className="mt-3 flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <label
            key={n}
            className={`focus-ring-within flex-1 cursor-pointer select-none rounded-full py-3 text-center text-base font-extrabold transition-[background-color,color,scale] duration-(--duration-fast) ease-out active:scale-(--press-scale) active:duration-(--duration-press) ${
              value === n
                ? "bg-action text-white"
                : "bg-cream text-ink hover:bg-cream-deep"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={n}
              defaultChecked={value === n}
              onChange={() => onChange(n)}
              className="sr-only"
            />
            {n}
          </label>
        ))}
      </div>

      {showScale && (
        <p
          aria-hidden
          className="mt-1.5 flex justify-between px-1 text-sm font-medium text-muted"
        >
          <span>Buruk</span>
          <span>Sangat baik</span>
        </p>
      )}
    </fieldset>
  );
}

/**
 * The file input is visually hidden behind a large dashed drop target, and
 * chosen photos show as thumbnails — the browser's own "Choose files · No
 * file chosen" row looked like a different site. The target goes away once
 * the limit is reached.
 */
type Photo = { file: File; url: string };

function PhotoPicker({
  photos,
  onPick,
  onRemove,
  error,
}: {
  photos: Photo[];
  onPick: (list: FileList | null) => void;
  onRemove: (index: number) => void;
  error: string | null;
}) {
  const full = photos.length >= PHOTO_MAX_COUNT;

  return (
    <div className="mt-7">
      <p className={LABEL_CLASS}>
        Foto{" "}
        <span className="font-medium text-muted">
          (opsional, maks. {PHOTO_MAX_COUNT})
        </span>
      </p>
      <p className="mt-1 text-sm font-medium text-muted">
        Tunjukkan kamar dan fasilitas yang kamu nilai. Foto tidak bisa dihapus
        setelah terkirim, jadi jangan memuat wajah atau data pribadi orang lain.
      </p>

      {photos.length > 0 && (
        <ul className="mt-3 grid grid-cols-3 gap-3">
          {photos.map(({ file, url }, index) => (
            <li key={url} className="relative">
              {/* A local blob preview: next/image has nothing to optimise. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="aspect-square w-full rounded-box bg-cream object-cover"
              />
              <button
                type="button"
                onClick={() => onRemove(index)}
                aria-label={`Hapus foto ${file.name}`}
                className="group absolute -right-2 -top-2 grid size-11 place-items-center rounded-full"
              >
                <span className="grid size-8 place-items-center rounded-full bg-ink text-white shadow-control transition-colors duration-(--duration-fast) hover:bg-danger group-active:bg-danger">
                  <X aria-hidden className="size-4" strokeWidth={2.5} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {!full && (
        <label className="focus-ring-within mt-3 flex min-h-22 cursor-pointer flex-col items-center justify-center gap-1 rounded-box border-2 border-dashed border-field bg-cream/50 px-4 py-4 text-center transition-colors duration-(--duration-fast) hover:border-muted hover:bg-cream active:bg-cream-deep">
          {/* No `name`: the files must not ride along to the Server Action. */}
          <input
            type="file"
            multiple
            accept={Object.keys(PHOTO_TYPES).join(",")}
            onChange={(e) => {
              onPick(e.target.files);
              // Lets the same file be picked again after removing it.
              e.target.value = "";
            }}
            className="sr-only"
          />
          <span className="flex items-center gap-2 text-base font-extrabold text-ink">
            <ImagePlus aria-hidden className="size-5" strokeWidth={2} />
            {photos.length ? "Tambah foto" : "Pilih foto"}
          </span>
          <span className="text-sm font-medium text-muted">
            JPG, PNG, atau WebP · maks. 2 MB per foto
          </span>
        </label>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm font-bold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Replaces the form once the review is saved. Focus moves to the heading, so
 * a screen reader announces it and the page scrolls to it — the form above
 * was far taller, and without this the visitor is left looking at the footer.
 */
function SavedCard({ photoError }: { photoError?: string | null }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, []);

  return (
    <div role="status" className="rounded-panel bg-white p-8 text-center shadow-lift">
      <CircleCheck
        aria-hidden
        className="mx-auto size-10 text-teal"
        strokeWidth={2}
      />
      <h2
        ref={heading}
        tabIndex={-1}
        className="mt-3 text-xl font-extrabold text-ink outline-none"
      >
        Review kamu tersimpan
      </h2>
      <p className="mt-2 text-base font-medium text-muted">
        Skor kos sudah ikut dihitung ulang.
      </p>
      {photoError && (
        <p
          role="alert"
          className={`mx-auto mt-5 max-w-[46ch] text-left ${NOTICE_CLASS.error}`}
        >
          Tapi foto gagal diunggah: {photoError}
        </p>
      )}
      <a href="#ulasan" className={buttonClass("soft", "md", "mt-6")}>
        Lihat review
      </a>
    </div>
  );
}
