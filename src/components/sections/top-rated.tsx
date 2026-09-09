import Link from "next/link";
import { KosCard } from "@/components/ui/kos-card";
import { KOS_LIST, STATS } from "@/data/kos";

export function TopRated() {
  return (
    <section id="browse" className="px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
      <div className="mx-auto max-w-[1240px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow bg-white text-rose">Near UGM</p>
            <h2 className="mt-6 text-[clamp(2.25rem,5vw,3.5rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-ink">
              Highest rated this month
            </h2>
          </div>

          <Link
            href="#browse"
            className="rounded-full bg-white px-7 py-3.5 text-[15px] font-extrabold text-ink shadow-[var(--shadow-lift)] transition-transform hover:-translate-y-0.5"
          >
            See all {STATS.nearCampus} →
          </Link>
        </div>

        <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {KOS_LIST.slice(0, 3).map((kos) => (
            <KosCard key={kos.id} kos={kos} />
          ))}
        </div>
      </div>
    </section>
  );
}
