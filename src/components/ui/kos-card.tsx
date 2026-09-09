import Link from "next/link";
import { ACCENT_BG } from "./accent";
import { KosScoreBadge } from "./kos-score-badge";
import type { Kos } from "@/data/kos";
import { formatDistance, formatRupiah } from "@/lib/format";

export function KosCard({ kos }: { kos: Kos }) {
  return (
    <Link
      href={`/kos/${kos.id}`}
      className="flex flex-col rounded-[var(--radius-panel)] bg-white p-4 shadow-[var(--shadow-lift)] transition-transform hover:-translate-y-1"
    >
      <div
        className={`flex h-[190px] items-center justify-center rounded-[22px] text-[11px] font-extrabold tracking-[0.18em] ${ACCENT_BG[kos.photoAccent]} ${
          kos.photoAccent === "amber" || kos.photoAccent === "sky"
            ? "text-ink/45"
            : "text-white/70"
        }`}
      >
        PHOTO
      </div>

      <div className="flex flex-1 flex-col px-3 pb-2 pt-6">
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-extrabold leading-tight text-ink">
              {kos.name}
            </h3>
            <p className="mt-1 text-[15px] font-medium text-muted">
              {kos.area}, {kos.city}
            </p>
            {kos.campus && (
              <p className="mt-0.5 text-sm font-medium text-muted">
                {formatDistance(kos.distance)} ke {kos.campus}
              </p>
            )}
          </div>
          <KosScoreBadge kos={kos} />
        </div>

        <ul className="mt-5 mb-6 flex flex-wrap gap-2.5">
          {kos.highlights.map((h) => (
            <li
              key={h.label}
              className="rounded-full bg-cream px-4 py-2 text-sm font-bold text-ink"
            >
              {h.label} {h.score.toFixed(1)}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-baseline justify-between border-t border-cream-deep pt-5">
          <p className="text-xl font-extrabold text-ink">
            {formatRupiah(kos.price)}
          </p>
          <p className="text-[15px] font-medium text-muted">
            {kos.reviews} reviews
          </p>
        </div>
      </div>
    </Link>
  );
}
