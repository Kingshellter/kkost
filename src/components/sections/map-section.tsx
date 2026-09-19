import { KosSidebar } from "@/components/map/kos-sidebar";
import { MapFrame } from "@/components/map/map-frame";
import type { Kos } from "@/data/kos";
import { isNarrowed, type KosFilter } from "@/lib/kos-browse";

export function MapSection({
  kos,
  signedIn,
  filter,
}: {
  kos: Kos[];
  signedIn: boolean;
  /** The URL filter; the map also applies it to kos added this session. */
  filter: KosFilter;
}) {
  // The URL filter removed some kos — say so, or the map looks half-empty.
  const narrowed = isNarrowed(filter);
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
          <p className="eyebrow bg-white/10 text-amber">Di mana saja</p>
          <h2 className="mt-7 text-[clamp(2.25rem,5vw,3.5rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-white">
            Semua kos di peta
          </h2>
          <p className="mx-auto mt-5 max-w-[52ch] text-lg text-white/70">
            {narrowed
              ? `Menampilkan ${kos.length} kos yang cocok dengan filter di bawah.`
              : "Dari Sabang sampai Merauke. Jarak ke kampus adalah satu hal yang tidak bisa direnovasi."}
          </p>
        </div>

        <div className="mt-14 grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="h-[440px] overflow-hidden rounded-[var(--radius-panel)] shadow-[var(--shadow-float)] sm:h-[460px] lg:h-[520px]">
            <MapFrame kos={kos} signedIn={signedIn} filter={filter} />
          </div>

          <KosSidebar kos={kos} filter={filter} />
        </div>
      </div>
    </section>
  );
}
