import { ACCENT_BG, ACCENT_ON } from "@/components/ui/accent";
import { BoundaryCircle, SEAMS } from "@/components/ui/boundary-circle";
import { CRITERION_ICON } from "@/components/ui/criterion-icon";
import { MaskLine } from "@/components/ui/mask-line";
import { Reveal } from "@/components/ui/reveal";
import {
  REVEAL_BASE,
  REVEAL_GROW,
  REVEAL_POP,
  REVEAL_RISE,
  step,
} from "@/components/ui/reveal-classes";
import { CRITERIA } from "@/data/kos";

/**
 * "Cara kerja": the problem in one line, the six things tenants score as
 * numbered cards, and an amber panel with how the score is made. Built from
 * the Claude Design file "Fasilitas Section v2". The guidebook weighs
 * "Kejelasan Permasalahan dan Solusi" at 20%, so it stays right under the
 * hero.
 *
 * The entrance plays in three `Reveal` blocks (header, cards, panel), each
 * time one reaches the screen. `#dampak` and `#scoring` survive on the
 * header and the cards, so older links still land. Deliberately free of
 * statistics: nothing here cites a number the project cannot source.
 */
export function HowItWorks() {
  return (
    <section
      id="cara-kerja"
      className="relative scroll-mt-24 overflow-hidden bg-white px-gutter py-section lg:scroll-mt-0 lg:py-section-lg"
    >
      <BoundaryCircle edge="top" circle={SEAMS.heroImpact} />
      {/* A dot on the rim of the seam circle, as in the design. Positioned
          against the section, like the circle, so the two stay touching. */}
      <Reveal className="pointer-events-none absolute left-32 top-9 lg:left-64 lg:top-18">
        <span
          aria-hidden
          style={step(4)}
          className={`block size-4.5 rounded-full bg-amber ${REVEAL_GROW}`}
        />
      </Reveal>

      <div className="relative mx-auto w-full max-w-page">
        <Reveal className="lg:grid lg:grid-cols-[7fr_5fr] lg:items-end lg:gap-16">
          <h2
            id="dampak"
            className="scroll-mt-24 font-extrabold text-ink text-display lg:scroll-mt-0 lg:text-display-split"
          >
            <MaskLine beat={0}>
              Enam hal yang{" "}
              <span className="relative isolate inline-block">
                tidak
                <span
                  aria-hidden
                  style={step(6)}
                  className={`absolute -inset-x-0.5 bottom-[0.08em] -z-10 h-[0.2em] origin-left rounded-sm bg-amber ${REVEAL_BASE} group-data-[reveal=hidden]/reveal:scale-x-(--reveal-swipe)`}
                />
              </span>
            </MaskLine>
            <MaskLine beat={1}>ada di iklan kos</MaskLine>
          </h2>

          <p
            style={step(3)}
            className={`mt-5 max-w-[52ch] text-pretty text-lg leading-relaxed text-ink-soft lg:mt-0 ${REVEAL_RISE}`}
          >
            Air yang mati tiap pagi atau WiFi yang cuma kuat di ruang tamu baru
            ketahuan setelah sewa dibayar. Di kkost, penghuninya yang menilai.
          </p>
        </Reveal>

        <div id="scoring" className="scroll-mt-24 lg:scroll-mt-0">
          <Reveal
            as="ul"
            className="mt-10 grid gap-3 sm:grid-cols-2 sm:gap-5 lg:mt-16 lg:grid-cols-3"
          >
            {CRITERIA.map((item, i) => {
              const Icon = CRITERION_ICON[item.key];
              return (
                <li key={item.key} style={step(i)} className={REVEAL_RISE}>
                  <div className="flex h-full items-center gap-4 rounded-media border border-lavender/70 bg-white p-4 sm:flex-col sm:items-stretch sm:gap-5 sm:p-7">
                    <div className="flex shrink-0 items-center justify-between sm:w-full">
                      <span
                        style={step(i + 2)}
                        className={`grid size-12 place-items-center rounded-full sm:size-14 ${ACCENT_BG[item.accent]} ${ACCENT_ON[item.accent]} ${REVEAL_POP}`}
                      >
                        <Icon aria-hidden className="size-6 sm:size-7" strokeWidth={2} />
                      </span>
                      <span className="hidden text-sm font-semibold tracking-widest text-muted tabular-nums sm:block">
                        {item.number}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-bold tracking-tight text-ink sm:text-xl">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm leading-snug text-muted sm:mt-1.5 sm:text-base">
                        {item.description}
                      </p>
                    </div>
                    <span className="self-start text-sm font-semibold tracking-widest text-muted tabular-nums sm:hidden">
                      {item.number}
                    </span>
                  </div>
                </li>
              );
            })}
          </Reveal>
        </div>

        <Reveal className="mt-10 lg:mt-16">
          <div
            className={`relative grid items-center gap-8 overflow-hidden rounded-panel bg-amber p-7 text-ink sm:p-10 lg:grid-cols-[auto_1fr] lg:gap-16 lg:p-14 ${REVEAL_RISE}`}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-40 -right-30 size-90 rounded-full bg-amber-soft"
            />

            <div aria-hidden className="relative flex -space-x-2.5 sm:-space-x-3.5">
              {CRITERIA.map((item, i) => {
                const Icon = CRITERION_ICON[item.key];
                return (
                  <span
                    key={item.key}
                    style={step(i + 2)}
                    className={`grid size-12 place-items-center rounded-full ring-4 ring-white sm:size-16 ${ACCENT_BG[item.accent]} ${ACCENT_ON[item.accent]} ${REVEAL_POP} group-data-[reveal=hidden]/reveal:-translate-x-(--reveal-shift)`}
                  >
                    <Icon className="size-6 sm:size-7" strokeWidth={2} />
                  </span>
                );
              })}
            </div>

            <p className="relative text-pretty text-xl font-medium leading-relaxed lg:text-2xl">
              Tiap fasilitas dinilai 1 sampai 5.{" "}
              <strong className="font-extrabold">
                Skor kos adalah rata-rata keenamnya
              </strong>
              : tanpa bobot, tidak bisa dibeli, dan tidak bisa dihapus pemilik
              kos.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
