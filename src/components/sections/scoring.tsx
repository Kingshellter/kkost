import { ACCENT_BG, ACCENT_ON } from "@/components/ui/accent";
import { CRITERIA } from "@/data/kos";

export function Scoring() {
  return (
    <section id="scoring" className="px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
      <div className="mx-auto max-w-[1160px]">
        <div className="text-center">
          <p className="eyebrow bg-white text-blue">Cara menilai</p>

          <h2 className="mx-auto mt-7 max-w-[20ch] text-balance text-[clamp(2.25rem,5vw,3.5rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-ink">
            Enam hal yang tidak pernah terlihat di foto
          </h2>

          <p className="mx-auto mt-6 max-w-[56ch] text-lg leading-relaxed text-ink-soft">
            Setiap penghuni menilai masing-masing dari 1 sampai 5. Skor kos
            adalah rata-rata polosnya — tanpa bobot, tidak bisa dibeli.
          </p>
        </div>

        <ul className="mt-20 grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {CRITERIA.map((item) => (
            <li key={item.number} className="flex flex-col items-center text-center">
              <span
                className={`flex h-[110px] w-[110px] items-center justify-center rounded-full text-[32px] font-extrabold tabular-nums ${ACCENT_BG[item.accent]} ${ACCENT_ON[item.accent]}`}
              >
                {item.number}
              </span>
              <h3 className="mt-7 text-xl font-extrabold text-ink">
                {item.title}
              </h3>
              <p className="mt-3 max-w-[34ch] text-[15px] leading-relaxed text-ink-soft">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
