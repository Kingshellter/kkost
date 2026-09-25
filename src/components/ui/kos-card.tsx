import Link from "next/link";
import { KosPhoto } from "./kos-photo";
import { KosScoreBadge } from "./kos-score-badge";
import type { Kos } from "@/data/kos";
import { formatCampus, formatRupiah } from "@/lib/format";

export function KosCard({ kos }: { kos: Kos }) {
  return (
    <Link
      href={`/kos/${kos.id}`}
      className="flex flex-col rounded-panel bg-white p-4 shadow-lift transition-[translate,scale] duration-(--duration-fast) ease-out hover:-translate-y-(--hover-lift) active:translate-y-0 active:scale-(--press-scale-surface) active:duration-(--duration-press)"
    >
      <KosPhoto kos={kos} className="h-[190px] rounded-media short:h-[140px]" />

      <div className="flex flex-1 flex-col px-3 pb-2 pt-6">
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-extrabold leading-tight text-ink">
              {kos.name}
            </h3>
            <p className="mt-1 text-sm font-medium text-muted">
              {kos.area}, {kos.city}
            </p>
            {kos.campus && (
              <p className="mt-0.5 text-sm font-medium text-muted">
                {formatCampus(kos.campus, kos.distance)}
              </p>
            )}
          </div>
          <KosScoreBadge kos={kos} />
        </div>

        {/* Kos from the database carry no highlights; `empty:hidden` keeps
            the list's margins from leaving a hole in the card. */}
        <ul className="mt-5 flex flex-wrap gap-2 empty:hidden">
          {kos.highlights.map((h) => (
            <li
              key={h.label}
              className="rounded-full bg-cream px-3.5 py-1.5 text-sm font-bold text-ink"
            >
              {h.label} {h.score.toFixed(1)}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-6">
          <div className="flex items-baseline justify-between border-t border-cream-deep pt-5">
            <p className="text-xl font-extrabold text-ink">
              {formatRupiah(kos.price)}
              <span className="text-sm font-medium text-muted"> / bulan</span>
            </p>
            <p className="text-sm font-medium text-muted">
              {kos.reviews} review
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
