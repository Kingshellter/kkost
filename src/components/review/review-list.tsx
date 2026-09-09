import { FacilityBar } from "@/components/ui/facility-bar";
import { ScoreBadge } from "@/components/ui/score-badge";
import { accentForScore } from "@/components/ui/accent";
import { CRITERIA, type Review } from "@/data/kos";

const dateFmt = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) {
    return (
      <div className="rounded-[var(--radius-panel)] bg-white p-8 text-center shadow-[var(--shadow-lift)]">
        <p className="text-xl font-extrabold text-ink">Belum ada review</p>
        <p className="mx-auto mt-2 max-w-[38ch] text-[15px] font-medium text-muted">
          Kos ini belum punya skor karena belum ada yang menilainya. Kalau kamu
          pernah tinggal di sini, kamu yang pertama.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-5">
      {reviews.map((review) => (
        <li
          key={review.id}
          className="rounded-[var(--radius-panel)] bg-white p-7 shadow-[var(--shadow-lift)]"
        >
          <div className="flex items-start gap-4">
            <ScoreBadge
              score={review.average}
              accent={accentForScore(review.average)}
            />
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-[17px] font-extrabold text-ink">
                  {review.authorName}
                </span>
                {review.isStudent && (
                  <span className="rounded-full bg-blue/10 px-3 py-1 text-xs font-extrabold text-blue">
                    Penghuni terverifikasi
                  </span>
                )}
              </p>
              <p className="mt-1 text-sm font-medium text-muted">
                {dateFmt.format(new Date(review.createdAt))}
              </p>
            </div>
          </div>

          {review.body && (
            <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">
              {review.body}
            </p>
          )}

          <div className="mt-6 grid gap-3.5 sm:grid-cols-2 sm:gap-x-8">
            {CRITERIA.map((c) => (
              <FacilityBar
                key={c.key}
                label={c.title}
                score={review.scores[c.key]}
                accent={c.accent}
              />
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
