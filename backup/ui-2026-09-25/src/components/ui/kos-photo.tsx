import type { Accent, Kos } from "@/data/kos";
import { ACCENT_BG } from "./accent";

/**
 * The picture slot for a kos — the only component that draws one.
 *
 * Every kos gets a flat illustration in the brand palette, labelled
 * "Ilustrasi". Real photos belong to reviews (0010, `ReviewPhotos`), where
 * they are one tenant's evidence, not a picture kkost presents as the kos. A
 * drawing that looked like a photo of the actual room would be a small lie on
 * a site whose argument is honesty.
 */
export function KosPhoto({
  kos,
  className = "",
  showLabel = true,
}: {
  kos: Pick<Kos, "name" | "photoAccent">;
  className?: string;
  /** Off only where the slot is too small for a chip, e.g. the hero avatar. */
  showLabel?: boolean;
}) {
  const Scene = SCENES[kos.photoAccent];

  return (
    <div
      role="img"
      aria-label={`Ilustrasi untuk ${kos.name}, bukan foto asli`}
      className={`relative overflow-hidden ${ACCENT_BG[kos.photoAccent]} ${className}`}
    >
      <svg
        aria-hidden
        viewBox="0 0 320 200"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <Scene />
      </svg>

      {showLabel && (
        <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-extrabold tracking-[0.04em] text-ink">
          Ilustrasi
        </span>
      )}
    </div>
  );
}

/** A room with a bed under a window. */
function Bedroom() {
  return (
    <>
      <rect y="150" width="320" height="50" className="fill-white/20" />
      <rect x="38" y="36" width="78" height="64" rx="12" className="fill-white/90" />
      <rect x="75" y="36" width="4" height="64" className="fill-amber-soft" />
      <rect x="38" y="66" width="78" height="4" className="fill-amber-soft" />
      <rect x="150" y="82" width="22" height="78" rx="8" className="fill-ink" />
      <rect x="150" y="120" width="136" height="32" rx="12" className="fill-white" />
      <rect x="200" y="114" width="86" height="38" rx="12" className="fill-ink-soft" />
      <rect x="164" y="106" width="36" height="17" rx="8" className="fill-cream" />
      <rect x="158" y="150" width="8" height="14" rx="3" className="fill-ink" />
      <rect x="272" y="150" width="8" height="14" rx="3" className="fill-ink" />
      <circle cx="126" cy="140" r="14" className="fill-ink/80" />
      <rect x="122" y="144" width="8" height="20" className="fill-ink" />
    </>
  );
}

/** A study corner — shelf, desk, laptop. */
function Study() {
  return (
    <>
      <rect y="150" width="320" height="50" className="fill-white/25" />
      <rect x="36" y="58" width="100" height="7" rx="3" className="fill-ink" />
      <rect x="46" y="30" width="12" height="28" rx="2" className="fill-rose" />
      <rect x="61" y="36" width="10" height="22" rx="2" className="fill-white" />
      <rect x="74" y="26" width="13" height="32" rx="2" className="fill-ink-soft" />
      <rect x="90" y="40" width="22" height="18" rx="4" className="fill-amber" />
      <rect x="150" y="108" width="146" height="10" rx="4" className="fill-ink" />
      <rect x="160" y="118" width="8" height="46" rx="3" className="fill-ink" />
      <rect x="278" y="118" width="8" height="46" rx="3" className="fill-ink" />
      <rect x="192" y="78" width="54" height="30" rx="5" className="fill-white" />
      <rect x="184" y="104" width="70" height="5" rx="2" className="fill-cream" />
      <rect x="264" y="70" width="4" height="38" className="fill-ink" />
      <path d="M252 72 L280 72 L272 56 L260 56 Z" className="fill-amber" />
      <rect x="96" y="118" width="40" height="9" rx="4" className="fill-white" />
      <rect x="96" y="84" width="9" height="42" rx="4" className="fill-white" />
      <rect x="100" y="126" width="6" height="36" className="fill-white/80" />
      <rect x="126" y="126" width="6" height="36" className="fill-white/80" />
    </>
  );
}

/** The kos from the street — a two-storey house with a door and windows. */
function House() {
  return (
    <>
      <circle cx="262" cy="46" r="20" className="fill-amber-soft" />
      <rect y="168" width="320" height="32" className="fill-white/25" />
      <path d="M70 76 L160 34 L250 76 Z" className="fill-ink" />
      <rect x="82" y="76" width="156" height="94" className="fill-cream" />
      <rect x="100" y="90" width="30" height="24" rx="4" className="fill-sky" />
      <rect x="145" y="90" width="30" height="24" rx="4" className="fill-sky" />
      <rect x="190" y="90" width="30" height="24" rx="4" className="fill-sky" />
      <rect x="100" y="130" width="30" height="24" rx="4" className="fill-sky" />
      <rect x="190" y="130" width="30" height="24" rx="4" className="fill-sky" />
      <rect x="146" y="128" width="28" height="42" rx="4" className="fill-ink-soft" />
      <circle cx="168" cy="150" r="2.5" className="fill-amber" />
      <circle cx="276" cy="148" r="20" className="fill-ink/80" />
      <rect x="272" y="150" width="8" height="20" className="fill-ink" />
    </>
  );
}

/** A shared kitchen — cabinets, counter, a pot on the stove. */
function Kitchen() {
  return (
    <>
      <rect x="34" y="34" width="124" height="38" rx="8" className="fill-white/90" />
      <rect x="94" y="34" width="4" height="38" className="fill-blue/30" />
      <rect x="196" y="34" width="90" height="38" rx="8" className="fill-white/90" />
      <rect x="26" y="116" width="268" height="12" rx="4" className="fill-ink" />
      <rect x="26" y="128" width="268" height="44" className="fill-white/85" />
      <rect x="116" y="128" width="3" height="44" className="fill-blue/25" />
      <rect x="206" y="128" width="3" height="44" className="fill-blue/25" />
      <circle cx="104" cy="150" r="3" className="fill-ink" />
      <circle cx="130" cy="150" r="3" className="fill-ink" />
      <rect x="190" y="92" width="46" height="24" rx="7" className="fill-ink-soft" />
      <rect x="184" y="88" width="58" height="6" rx="3" className="fill-ink" />
      <rect x="208" y="80" width="10" height="8" rx="3" className="fill-ink" />
      <rect x="56" y="96" width="20" height="20" rx="4" className="fill-rose" />
      <circle cx="66" cy="88" r="12" className="fill-amber-soft" />
      <rect y="172" width="320" height="28" className="fill-white/20" />
    </>
  );
}

// Keyed by the kos's accent, which is derived from its id (photoAccentFor in
// kos-repository.ts) — so a kos keeps its scene on every page without storing
// anything new. Neighbouring cards can repeat a scene; that is fine.
const SCENES: Record<Accent, () => React.JSX.Element> = {
  amber: Bedroom,
  sky: Study,
  rose: House,
  blue: Kitchen,
  ink: Bedroom,
};
