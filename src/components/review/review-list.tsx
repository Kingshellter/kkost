import Image from "next/image";
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
                    Mahasiswa terverifikasi
                  </span>
                )}
                {review.isDemo && (
                  <span
                    title="Ditulis akun contoh kkost untuk demonstrasi, bukan penghuni sungguhan"
                    className="rounded-full bg-cream px-3 py-1 text-xs font-extrabold text-muted"
                  >
                    Review contoh
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

          {review.photos.length > 0 && (
            <ReviewPhotos photos={review.photos} author={review.authorName} />
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

/**
 * The author's photos, as evidence for this review only — never promoted to
 * the kos banner or card. Each opens full size in a new tab.
 */
function ReviewPhotos({ photos, author }: { photos: string[]; author: string }) {
  return (
    <ul className="mt-5 grid grid-cols-3 gap-2.5 sm:max-w-[420px]">
      {photos.map((src, index) => (
        <li key={src}>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="relative block aspect-square overflow-hidden rounded-2xl bg-cream-deep transition-opacity hover:opacity-85"
          >
            <Image
              src={src}
              alt={`Foto ${index + 1} dari review ${author}`}
              fill
              sizes="140px"
              className="object-cover"
            />
          </a>
        </li>
      ))}
    </ul>
  );
}
