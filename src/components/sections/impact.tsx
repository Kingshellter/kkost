import { BoundaryCircle, SEAMS } from "@/components/ui/boundary-circle";
import { PROBLEMS } from "@/data/kos";

/**
 * The problem kkost exists for. The guidebook weighs "Kejelasan Permasalahan
 * dan Solusi" at 20%, so it is argued on the page instead of only in the
 * README. One screen tall on a laptop.
 *
 * Deliberately free of statistics: nothing here cites a number the project
 * cannot source.
 */
const SCREEN =
  "relative overflow-hidden bg-white px-4 py-24 sm:px-6 lg:flex lg:min-h-svh lg:flex-col lg:justify-center lg:px-10 lg:py-16 short:py-10";

export function Impact() {
  return (
    <section id="dampak" className={SCREEN}>
      <BoundaryCircle edge="top" circle={SEAMS.heroImpact} />

      <div className="reveal relative mx-auto w-full max-w-[1160px]">
        <div className="text-center">
          <p className="eyebrow bg-cream text-rose">Masalahnya</p>
          <h2 className="mx-auto mt-7 max-w-[22ch] text-balance text-[clamp(2.25rem,5vw,3.5rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-ink lg:mt-6">
            Iklan kos ditulis oleh orang yang menyewakannya
          </h2>
          <p className="mx-auto mt-6 max-w-[58ch] text-lg leading-relaxed text-ink-soft lg:mt-5">
            Foto dipilih pemilik, deskripsi ditulis pemilik. Hal yang paling
            menentukan setahun hidupmu justru tidak pernah tampil di sana.
          </p>
        </div>

        <ul className="mt-16 grid gap-6 md:grid-cols-3 lg:mt-12">
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

        <p className="mx-auto mt-12 max-w-[60ch] text-balance text-center text-xl font-extrabold leading-snug text-ink lg:mt-10">
          kkost mengubah pengalaman penghuni menjadi skor enam fasilitas yang
          terstruktur, bisa dibandingkan antarkota, dan dijaga database agar
          tidak bisa dihapus pemilik kos.
        </p>
      </div>
    </section>
  );
}
