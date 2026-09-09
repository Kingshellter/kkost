import { KosSidebar } from "@/components/map/kos-sidebar";
import { MapFrame } from "@/components/map/map-frame";
import type { Kos } from "@/data/kos";

export function MapSection({
  kos,
  signedIn,
}: {
  kos: Kos[];
  signedIn: boolean;
}) {
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
            From Sabang to Merauke. Distance to campus is the one thing you
            cannot renovate.
          </p>
        </div>

        <div className="mt-14 grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="h-[380px] overflow-hidden rounded-[var(--radius-panel)] shadow-[var(--shadow-float)] sm:h-[460px] lg:h-[520px]">
            <MapFrame kos={kos} signedIn={signedIn} />
          </div>

          <KosSidebar kos={kos} />
        </div>
      </div>
    </section>
  );
}
