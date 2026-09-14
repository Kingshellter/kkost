import { ACCENT_BG, ACCENT_ON } from "@/components/ui/accent";
import { PROBLEMS, SDG_GOALS } from "@/data/kos";

/**
 * The problem kkost exists for, and the SDGs it contributes to. The guidebook
 * weighs "Kejelasan Permasalahan dan Solusi" at 20% and requires at least one
 * SDG, so both are argued on the page instead of only in the README.
 *
 * Deliberately free of statistics: nothing here cites a number the project
 * cannot source.
 */
export function Impact() {
  return (
    <section id="dampak" className="bg-white px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
      <div className="mx-auto max-w-[1160px]">
        <div className="text-center">
          <p className="eyebrow bg-cream text-rose">Masalahnya</p>
          <h2 className="mx-auto mt-7 max-w-[22ch] text-balance text-[clamp(2.25rem,5vw,3.5rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-ink">
            Iklan kos ditulis oleh orang yang menyewakannya
          </h2>
          <p className="mx-auto mt-6 max-w-[58ch] text-lg leading-relaxed text-ink-soft">
            Foto dipilih pemilik, deskripsi ditulis pemilik. Hal yang paling
            menentukan setahun hidupmu justru tidak pernah tampil di sana.
          </p>
        </div>

        <ul className="mt-16 grid gap-6 md:grid-cols-3">
          {PROBLEMS.map((problem, index) => (
            <li
              key={problem.title}
              className="rounded-[var(--radius-panel)] bg-cream p-7"
            >
              <span className="text-sm font-extrabold tabular-nums text-rose">
                0{index + 1}
              </span>
              <h3 className="mt-3 text-xl font-extrabold leading-tight text-ink">
                {problem.title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                {problem.detail}
              </p>
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-12 max-w-[60ch] text-balance text-center text-xl font-extrabold leading-snug text-ink">
          kkost mengubah pengalaman penghuni menjadi skor enam fasilitas yang
          terstruktur, bisa dibandingkan antarkota, dan dijaga database agar
          tidak bisa dihapus pemilik kos.
        </p>

        <div className="mt-24 text-center">
          <p className="eyebrow bg-cream text-blue">
            Tujuan Pembangunan Berkelanjutan
          </p>
          <h2 className="mx-auto mt-7 max-w-[24ch] text-balance text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-ink">
            Hunian layak dimulai dari informasi yang jujur
          </h2>
        </div>

        <ul className="mt-14 grid gap-6 sm:grid-cols-2">
          {SDG_GOALS.map((goal) => (
            <li
              key={goal.number}
              className="flex gap-5 rounded-[var(--radius-panel)] bg-cream p-7"
            >
              <span
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl font-extrabold tabular-nums ${ACCENT_BG[goal.accent]} ${ACCENT_ON[goal.accent]}`}
              >
                {goal.number}
              </span>
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-ink">
                    Target {goal.target}
                  </span>
                  {goal.primary && (
                    <span className="rounded-full bg-ink px-3 py-1 text-xs font-extrabold text-amber">
                      Utama
                    </span>
                  )}
                </p>
                <h3 className="mt-3 text-xl font-extrabold leading-tight text-ink">
                  SDG {goal.number} · {goal.name}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                  {goal.detail}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
