import { ACCENT_BG, ACCENT_ON } from "@/components/ui/accent";
import { CRITERIA } from "@/data/kos";

export function Scoring() {
  return (
    <section
      id="scoring"
      className="px-4 py-24 sm:px-6 lg:flex lg:min-h-svh lg:flex-col lg:justify-center lg:px-10 lg:py-14 short:py-8"
    >
      <div className="reveal mx-auto w-full max-w-[1160px]">
        <div className="text-center">
          <p className="eyebrow bg-white text-blue">Cara menilai</p>

          <h2 className="mx-auto mt-7 max-w-[20ch] text-balance text-[clamp(2.25rem,5vw,3.5rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-ink lg:mt-6 lg:text-[3rem]">
            Enam hal yang tidak pernah terlihat di foto
          </h2>

          <p className="mx-auto mt-6 max-w-[56ch] text-lg leading-relaxed text-ink-soft lg:mt-4">
            Setiap penghuni menilai masing-masing dari 1 sampai 5. Skor kos
            adalah rata-rata polosnya — tanpa bobot, tidak bisa dibeli.
          </p>
        </div>

        <ul className="mt-20 grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-y-10 short:mt-9 short:gap-y-7">
          {CRITERIA.map((item) => (
            <li key={item.number} className="flex flex-col items-center text-center">
              <span
                className={`flex h-[110px] w-[110px] items-center justify-center rounded-full text-[32px] font-extrabold tabular-nums lg:h-[84px] lg:w-[84px] lg:text-[28px] short:h-[68px] short:w-[68px] short:text-2xl ${ACCENT_BG[item.accent]} ${ACCENT_ON[item.accent]}`}
              >
                {item.number}
              </span>
              <h3 className="mt-7 text-xl font-extrabold text-ink lg:mt-4">
                {item.title}
              </h3>
              <p className="mt-3 max-w-[34ch] text-[15px] leading-relaxed text-ink-soft lg:mt-2">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
