import { ACCENT_BG, ACCENT_ON } from "@/components/ui/accent";
import { BoundaryCircle, SEAMS } from "@/components/ui/boundary-circle";
import { CRITERION_ICON } from "@/components/ui/criterion-icon";
import { CRITERIA } from "@/data/kos";

/**
 * The problem and the answer in one short read: a heading that names both,
 * one concrete sentence of problem, the six things tenants score, and how the
 * score is made. The guidebook weighs "Kejelasan Permasalahan dan Solusi" at
 * 20%, so it stays near the top of the page, but kept to a glance: the kos
 * list is what visitors came for.
 *
 * Header stacked, never split (headline left + paragraph right), and no
 * hairline per criterion: spacing and the icon circles already group them.
 *
 * `#dampak` and `#scoring` survive on the two halves, so older links still
 * land. Deliberately free of statistics: nothing here cites a number the
 * project cannot source.
 */
export function HowItWorks() {
  return (
    <section
      id="cara-kerja"
      className="relative scroll-mt-24 overflow-hidden bg-white px-gutter py-section lg:flex lg:min-h-svh lg:scroll-mt-0 lg:flex-col lg:justify-center lg:py-section-lg short:py-10"
    >
      <BoundaryCircle edge="top" circle={SEAMS.heroImpact} />

      <div className="relative mx-auto w-full max-w-page">
        <div id="dampak" className="scroll-mt-24 lg:scroll-mt-0">
          <h2 className="max-w-[20ch] text-balance font-extrabold text-ink text-title">
            Enam hal yang tidak ada di iklan kos
          </h2>
          <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-ink-soft short:mt-3 short:text-base">
            Air yang mati tiap pagi atau WiFi yang cuma kuat di ruang tamu baru
            ketahuan setelah sewa dibayar. Di kkost, penghuninya yang menilai.
          </p>
        </div>

        <div id="scoring" className="scroll-mt-24 lg:scroll-mt-0">
          <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:mt-14 lg:grid-cols-6 lg:gap-x-6 short:mt-10">
            {CRITERIA.map((item) => {
              const Icon = CRITERION_ICON[item.key];
              return (
                <li key={item.key}>
                  <span
                    className={`grid size-11 place-items-center rounded-full ${ACCENT_BG[item.accent]} ${ACCENT_ON[item.accent]}`}
                  >
                    <Icon aria-hidden className="size-5" strokeWidth={2} />
                  </span>
                  <h3 className="mt-3 text-base font-extrabold text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm leading-snug text-ink-soft">
                    {item.description}
                  </p>
                </li>
              );
            })}
          </ul>

          <p className="mt-10 max-w-[60ch] text-base leading-relaxed text-ink-soft lg:mt-12 short:mt-8">
            Tiap fasilitas dinilai 1 sampai 5.{" "}
            <strong className="font-extrabold text-ink">
              Skor kos adalah rata-rata keenamnya
            </strong>
            : tanpa bobot, tidak bisa dibeli, dan tidak bisa dihapus pemilik kos.
          </p>
        </div>
      </div>
    </section>
  );
}
