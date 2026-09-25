import { ACCENT_BG, ACCENT_ON } from "@/components/ui/accent";
import { BoundaryCircle, SEAMS } from "@/components/ui/boundary-circle";
import { CRITERION_ICON } from "@/components/ui/criterion-icon";
import { CRITERIA, PROBLEMS } from "@/data/kos";

/**
 * The problem and the answer on one screen: what an ad leaves out (left), and
 * the six things kkost has tenants score instead (right). The guidebook weighs
 * "Kejelasan Permasalahan dan Solusi" at 20%, so both stay near the top of the
 * page — but as one short section, not two screens of cards before the list.
 *
 * `#dampak` and `#scoring` survive on the two halves, so older links still
 * land. Deliberately free of statistics: nothing here cites a number the
 * project cannot source.
 */
export function HowItWorks() {
  return (
    <section
      id="cara-kerja"
      className="relative scroll-mt-24 overflow-hidden bg-white px-4 py-section sm:px-6 lg:flex lg:min-h-svh lg:scroll-mt-0 lg:flex-col lg:justify-center lg:px-10 lg:py-section-lg short:py-10"
    >
      <BoundaryCircle edge="top" circle={SEAMS.heroImpact} />

      <div className="reveal relative mx-auto grid w-full max-w-page gap-14 lg:grid-cols-[5fr_7fr] lg:gap-16">
        <div id="dampak" className="scroll-mt-24 lg:scroll-mt-0">
          <h2 className="max-w-[16ch] text-balance font-extrabold text-ink text-title">
            Iklan kos ditulis oleh orang yang menyewakannya
          </h2>
          <p className="mt-5 max-w-[48ch] text-lg leading-relaxed text-ink-soft short:mt-3 short:text-base">
            Foto dipilih pemilik, deskripsi ditulis pemilik. Hal yang paling
            menentukan setahun hidupmu justru tidak pernah tampil di sana.
          </p>

          <ul className="mt-8 divide-y divide-cream-deep border-t border-cream-deep short:mt-5">
            {PROBLEMS.map((problem) => (
              <li key={problem.title} className="py-4 short:py-3">
                <h3 className="text-base font-extrabold text-ink">
                  {problem.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  {problem.detail}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div id="scoring" className="scroll-mt-24 lg:scroll-mt-0">
          <h3 className="text-2xl font-extrabold leading-tight text-ink">
            Di kkost, penghuni menilai enam hal ini
          </h3>
          <p className="mt-3 max-w-[56ch] text-base leading-relaxed text-ink-soft">
            Masing-masing dari 1 sampai 5. Skor kos adalah rata-rata polosnya:
            tanpa bobot, dan tidak bisa dibeli.
          </p>

          <ul className="mt-7 grid gap-x-8 gap-y-6 sm:grid-cols-2 short:mt-5 short:gap-y-4">
            {CRITERIA.map((item) => {
              const Icon = CRITERION_ICON[item.key];
              return (
                <li key={item.key} className="flex items-start gap-4">
                  <span
                    className={`grid size-11 shrink-0 place-items-center rounded-full ${ACCENT_BG[item.accent]} ${ACCENT_ON[item.accent]}`}
                  >
                    <Icon aria-hidden className="size-5" strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-base font-extrabold text-ink">
                      {item.title}
                    </h4>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                      {item.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <p className="mt-8 max-w-[60ch] text-base font-bold leading-relaxed text-ink short:mt-6">
            kkost mengubah pengalaman penghuni menjadi skor enam fasilitas yang
            terstruktur, bisa dibandingkan antarkota, dan dijaga database agar
            tidak bisa dihapus pemilik kos.
          </p>
        </div>
      </div>
    </section>
  );
}
