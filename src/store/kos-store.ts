"use client";

import { create } from "zustand";
import { KOS_LIST, type Kos } from "@/data/kos";

type KosStore = {
  kos: Kos[];
  addKos: (kos: Kos) => void;
};

/**
 * Shared between the map and the "kos in view" sidebar so a newly added
 * pin shows up in both without prop-drilling through the server component.
 */
export const useKosStore = create<KosStore>((set) => ({
  kos: KOS_LIST,
  addKos: (kos) => set((state) => ({ kos: [kos, ...state.kos] })),
}));
