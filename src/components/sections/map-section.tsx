import { KosSidebar } from "@/components/map/kos-sidebar";
import { MapFrame } from "@/components/map/map-frame";
import { SCORE_HIGH, SCORE_MID } from "@/components/ui/accent";
import { BoundaryCircle, SEAMS } from "@/components/ui/boundary-circle";
import type { Kos } from "@/data/kos";
import { formatNumber } from "@/lib/format";
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
      className="relative scroll-mt-24 overflow-hidden bg-ink px-gutter pb-28 pt-section lg:scroll-mt-0 lg:flex lg:min-h-svh lg:flex-col lg:justify-center lg:py-14"
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
      {/* The seam circle reaches 100px up into this band. On a phone the
          legend is the last thing in it, so the bottom padding (pb-28) keeps
          the legend's white text off the amber. */}
      <BoundaryCircle edge="bottom" circle={SEAMS.mapBrowse} />

      <div className="reveal relative mx-auto w-full max-w-page">
        <div>
          <h2 className="font-extrabold text-white text-title">
            Semua kos di peta
          </h2>
          <p className="mt-5 max-w-[52ch] text-lg text-white/70 lg:mt-4">
            {narrowed
              ? `Menampilkan ${kos.length} kos yang cocok dengan filter di bawah.`
              : "Ketuk pin untuk melihat skornya dan membuka halaman kos."}
          </p>
        </div>

        {/* On a laptop the map row's height comes from the screen: everything
            else in the band is ~240px (padding, heading, intro), and 260
            leaves room for an intro that wraps at 1024. The legend takes its
            share of the row; the sidebar scrolls inside it. */}
        <div className="mt-8 grid gap-7 lg:h-[clamp(360px,calc(100svh-260px),640px)] lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-h-0 flex-col gap-4">
            <div className="h-[440px] overflow-hidden rounded-panel shadow-float sm:h-[460px] lg:h-auto lg:min-h-0 lg:flex-1">
              <MapFrame kos={kos} signedIn={signedIn} filter={filter} />
            </div>
            <MapLegend signedIn={signedIn} />
          </div>

          <KosSidebar kos={kos} filter={filter} />
        </div>
      </div>
    </section>
  );
}

/**
 * What the pin colours mean, and how to add a kos. The hint used to be a pill
 * over the map, where it hid pins; down here it covers nothing. Thresholds
 * come from `accentForScore`'s constants so the legend cannot drift from the
 * pins.
 */
function MapLegend({ signedIn }: { signedIn: boolean }) {
  const bands = [
    { dot: "bg-teal", label: `Baik (${formatNumber(SCORE_HIGH)} ke atas)` },
    { dot: "bg-amber", label: `Cukup (${formatNumber(SCORE_MID)} ke atas)` },
    { dot: "bg-rose-deep", label: `Kurang (di bawah ${formatNumber(SCORE_MID)})` },
    { dot: "bg-ink ring-2 ring-white/50", label: "Baru, belum dinilai" },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm text-white/70">
      <ul aria-label="Arti warna pin" className="flex flex-wrap gap-x-4 gap-y-1.5">
        {bands.map((band) => (
          <li key={band.label} className="flex items-center gap-2">
            <span aria-hidden className={`size-3 shrink-0 rounded-full ${band.dot}`} />
            {band.label}
          </li>
        ))}
      </ul>
      <p>
        Pilih titik kosong di peta untuk menambah kos
        {!signedIn && " (perlu masuk)"}.
      </p>
    </div>
  );
}
