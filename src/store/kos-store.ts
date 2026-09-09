"use client";

import { create } from "zustand";
import type { Kos } from "@/data/kos";

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
