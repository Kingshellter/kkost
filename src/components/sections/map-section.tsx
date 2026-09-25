import { KosSidebar } from "@/components/map/kos-sidebar";
import { MapFrame } from "@/components/map/map-frame";
import { BoundaryCircle, SEAMS } from "@/components/ui/boundary-circle";
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
      id="peta"
      className="relative scroll-mt-24 overflow-hidden bg-ink px-4 py-section sm:px-6 lg:scroll-mt-0 lg:flex lg:min-h-svh lg:flex-col lg:justify-center lg:px-10 lg:py-14"
    >
      {/* Decorative ring + blob from the deck */}
      <div
        aria-hidden
        className="drift pointer-events-none absolute -right-40 top-10 h-[420px] w-[420px] rounded-full border-[18px] border-white/[0.06]"
      />
      <div
        aria-hidden
        className="drift pointer-events-none absolute -left-48 bottom-10 h-[380px] w-[380px] rounded-full bg-white/[0.04]"
      />
      <BoundaryCircle edge="bottom" circle={SEAMS.mapBrowse}
      />

      <div className="reveal relative mx-auto w-full max-w-page">
        <div className="text-center">
          <h2 className="font-extrabold text-white text-title">
            Semua kos di peta
          </h2>
          <p className="mx-auto mt-5 max-w-[52ch] text-lg text-white/70 lg:mt-4">
            {narrowed
              ? `Menampilkan ${kos.length} kos yang cocok dengan filter di bawah.`
              : "Dari Sabang sampai Merauke. Jarak ke kampus adalah satu hal yang tidak bisa direnovasi."}
          </p>
        </div>

        {/* On a laptop the map row's height comes from the screen (everything
            else in the band is ~345px), and the sidebar scrolls inside it. */}
        <div className="mt-14 grid gap-7 lg:mt-10 lg:h-[clamp(360px,calc(100svh-345px),600px)] lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="h-[440px] overflow-hidden rounded-panel shadow-float sm:h-[460px] lg:h-full">
            <MapFrame kos={kos} signedIn={signedIn} filter={filter} />
          </div>

          <KosSidebar kos={kos} filter={filter} />
        </div>
      </div>
    </section>
  );
}
