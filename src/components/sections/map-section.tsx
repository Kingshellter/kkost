import Link from "next/link";
import { MapFrame } from "@/components/map/map-frame";
import { accentForScore } from "@/components/ui/accent";
import { ScoreBadge } from "@/components/ui/score-badge";
import { KOS_LIST } from "@/data/kos";
import { formatDistance, formatRupiah } from "@/lib/format";

export function MapSection() {
  return (
    <section
      id="reviews"
      className="relative overflow-hidden bg-ink px-4 py-24 sm:px-6 lg:px-10 lg:py-32"
    >
      {/* Decorative ring + blob from the deck */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-8 h-[420px] w-[420px] rounded-full border-[18px] border-white/[0.06]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-32 h-[380px] w-[380px] rounded-full bg-white/[0.04]"
      />

      <div className="relative mx-auto max-w-[1240px]">
        <div className="text-center">
          <p className="eyebrow bg-white/10 text-amber">Where they are</p>
          <h2 className="mt-7 text-[clamp(2.25rem,5vw,3.5rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-white">
            Every kos on the map
          </h2>
          <p className="mx-auto mt-5 max-w-[52ch] text-lg text-white/70">
            Distance to campus is the one thing you cannot renovate.
          </p>
        </div>

        <div className="mt-14 grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="h-[380px] overflow-hidden rounded-[var(--radius-panel)] shadow-[var(--shadow-float)] sm:h-[460px] lg:h-[520px]">
            <MapFrame />
          </div>

          <aside className="flex flex-col rounded-[var(--radius-panel)] bg-white p-7">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
              {KOS_LIST.length} kos in view
            </p>

            <ul className="mt-6 flex-1 space-y-6">
              {KOS_LIST.map((kos) => (
                <li key={kos.id} className="flex items-start gap-4">
                  <ScoreBadge
                    score={kos.score}
                    size="sm"
                    accent={accentForScore(kos.score)}
                  />
                  <div className="min-w-0">
                    <h3 className="text-[17px] font-extrabold leading-tight text-ink">
                      {kos.name}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-muted">
                      {kos.area} · {formatDistance(kos.distance)} ·{" "}
                      {formatRupiah(kos.price)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <Link
              href="#browse"
              className="mt-8 rounded-full bg-ink py-4 text-center text-[15px] font-extrabold text-white transition-transform hover:-translate-y-0.5"
            >
              Open full map
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
