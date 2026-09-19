"use client";

import dynamic from "next/dynamic";
import type { Kos } from "@/data/kos";
import type { KosFilter } from "@/lib/kos-browse";

/**
 * Leaflet touches `window` at import time, so the map can only load in the
 * browser. This client boundary exists solely to hold that dynamic import.
 */
const KosMap = dynamic(() => import("./kos-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#eee9e1] text-sm font-bold text-muted">
      Memuat peta…
    </div>
  ),
});

export function MapFrame({
  kos,
  signedIn,
  filter,
}: {
  kos: Kos[];
  signedIn: boolean;
  filter: KosFilter;
}) {
  return <KosMap kos={kos} signedIn={signedIn} filter={filter} />;
}
