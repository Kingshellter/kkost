import type { Accent } from "@/data/kos";

/**
 * Tailwind scans for complete class strings, so every accent variant is
 * spelled out here rather than composed at runtime.
 */
export const ACCENT_BG: Record<Accent, string> = {
  rose: "bg-rose",
  "rose-deep": "bg-rose-deep",
  amber: "bg-amber",
  blue: "bg-blue",
  sky: "bg-sky",
  teal: "bg-teal",
  ink: "bg-ink",
};

/** Text colour that stays legible on top of the matching ACCENT_BG. */
export const ACCENT_ON: Record<Accent, string> = {
  rose: "text-white",
  "rose-deep": "text-white",
  amber: "text-ink",
  blue: "text-white",
  sky: "text-ink",
  teal: "text-white",
  ink: "text-amber",
};

/**
 * Raw hex, for canvas/Leaflet markers that cannot take a class. Mirrors the
 * `--color-*` tokens in globals.css — change both together.
 */
export const ACCENT_HEX: Record<Accent, string> = {
  rose: "#f93a5a",
  "rose-deep": "#c81e40",
  amber: "#fcb800",
  blue: "#3b59df",
  sky: "#4fc3f7",
  teal: "#16805a",
  ink: "#1c2a4e",
};

/** Lowest average that still counts as a high score. */
export const SCORE_HIGH = 4.3;
/** Lowest average that still counts as a middling score. */
export const SCORE_MID = 3.5;

/**
 * Score bands for badges, map pins and the "kos in view" list: teal, amber,
 * rose-deep from good to poor. A scale of its own, apart from the brand —
 * rose used to mark the *best* kos while also meaning "button" and "error".
 */
export function accentForScore(score: number): Accent {
  if (score >= SCORE_HIGH) return "teal";
  if (score >= SCORE_MID) return "amber";
  return "rose-deep";
}
