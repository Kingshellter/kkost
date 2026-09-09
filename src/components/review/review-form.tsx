"use client";

import { useActionState, useState } from "react";
import { CRITERIA, type FacilityKey } from "@/data/kos";
import { REVIEW_INITIAL, type ReviewState } from "@/lib/action-state";
import { submitReview } from "@/lib/review-actions";

/** Six 1–5 scales plus an optional note. The average is computed server-side. */
export function ReviewForm({ kosId }: { kosId: string }) {
  const [state, formAction, pending] = useActionState<ReviewState, FormData>(
    submitReview,
    REVIEW_INITIAL,
  );

  if (state.ok) {
    return (
      <div
        role="status"
        className="rounded-[var(--radius-panel)] bg-white p-8 text-center shadow-[var(--shadow-lift)]"
      >
        <p className="text-xl font-extrabold text-ink">Review kamu tersimpan.</p>
        <p className="mt-2 text-[15px] font-medium text-muted">
          Skor kos langsung ikut berubah. Kamu bisa mengeditnya selama 30 hari.
        </p>
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
          rows={4}
          maxLength={2000}
          placeholder="Apa yang tidak terlihat dari foto?"
          className="mt-2.5 w-full resize-y rounded-[22px] border border-cream-deep bg-cream px-5 py-4 text-[15px] font-medium text-ink outline-none transition-colors placeholder:text-muted focus:border-rose"
        />
      </label>

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
        {pending ? "Menyimpan…" : "Kirim review"}
      </button>
    </form>
  );
}

/** Radio group styled as five pills — keyboard-navigable, no JS needed to submit. */
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
              checked={value === n}
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
