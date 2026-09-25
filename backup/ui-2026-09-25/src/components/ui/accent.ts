import type { Accent } from "@/data/kos";

/**
 * Tailwind scans for complete class strings, so every accent variant is
 * spelled out here rather than composed at runtime.
 */
export const ACCENT_BG: Record<Accent, string> = {
  rose: "bg-rose",
  amber: "bg-amber",
  blue: "bg-blue",
  sky: "bg-sky",
  ink: "bg-ink",
};

/** Text colour that stays legible on top of the matching ACCENT_BG. */
export const ACCENT_ON: Record<Accent, string> = {
  rose: "text-white",
  amber: "text-ink",
  blue: "text-white",
  sky: "text-ink",
  ink: "text-amber",
};

/** Raw hex, for canvas/Leaflet markers that cannot take a class. */
export const ACCENT_HEX: Record<Accent, string> = {
  rose: "#f93a5a",
  amber: "#fcb800",
  blue: "#3b59df",
  sky: "#4fc3f7",
  ink: "#1c2a4e",
};

/** Score bands used by the map pins and the "kos in view" list. */
export function accentForScore(score: number): Accent {
  if (score >= 4.6) return "rose";
  if (score >= 4.3) return "amber";
  return "blue";
}
