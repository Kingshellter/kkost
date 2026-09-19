"use client";

import { create } from "zustand";
import type { Kos } from "@/data/kos";
import { matchesKosFilter, type KosFilter } from "@/lib/kos-browse";

type KosStore = {
  /** Only the kos added during this session, newest first. */
  added: Kos[];
  addKos: (kos: Kos) => void;
};

/**
 * The server-rendered list arrives as props; this store holds *only* what the
 * user added by clicking the map. The map and the "kos in view" sidebar merge
 * the two, so a new pin appears in both without prop-drilling between siblings.
 *
 * Session-only: a refresh drops anything not persisted to Supabase.
 */
export const useKosStore = create<KosStore>((set) => ({
  added: [],
  addKos: (kos) => set((state) => ({ added: [kos, ...state.added] })),
}));

/**
 * The list the map and sidebar render. A kos saved to Supabase lands in the
 * store with its real id and then arrives again in the refreshed server list;
 * the server copy wins, so the pin and the sidebar row are not drawn twice.
 *
 * `fromServer` is already filtered by the URL; the added kos are not, so the
 * same filter is applied to them here — otherwise a kos in another city or
 * over budget would appear on a map that claims to show only matches.
 */
export function mergeKos(
  added: Kos[],
  fromServer: Kos[],
  filter: KosFilter,
): Kos[] {
  const onServer = new Set(fromServer.map((kos) => kos.id));
  return [
    ...added.filter(
      (kos) => !onServer.has(kos.id) && matchesKosFilter(kos, filter),
    ),
    ...fromServer,
  ];
}
