import { ACCENT_BG, ACCENT_ON } from "@/components/ui/accent";
import { TRUST_GUARANTEES } from "@/data/kos";

/**
 * The competition theme — "NextGen Secure: Building the Future of Trusted Web
 * Ecosystems" — answered on the page itself, not only in the README. Every
 * claim here names where it is enforced, because that is the whole argument:
 * the interface is not the security boundary.
 */
export function Trust() {
  return (
    <section
      id="trust"
      className="px-4 pb-24 sm:px-6 lg:flex lg:min-h-svh lg:flex-col lg:justify-center lg:px-10 lg:py-12 short:py-8"
    >
      <div className="reveal mx-auto w-full max-w-[1160px]">
        <div className="text-center">
          <p className="eyebrow bg-white text-rose">Kenapa bisa dipercaya</p>

          <h2 className="mx-auto mt-7 max-w-[22ch] text-balance text-[clamp(2.25rem,5vw,3.5rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-ink lg:mt-6 lg:text-[3rem] short:mt-5 short:text-[2.5rem]">
            Situs review hanya sekuat jaminan terlemahnya
          </h2>

          <p className="mx-auto mt-6 max-w-[58ch] text-lg leading-relaxed text-ink-soft lg:mt-4">
            Orang yang paling diuntungkan jika angka ini dibengkokkan adalah
            pemilik kos. Karena itu tidak satu pun aturan di bawah tinggal di
            tampilan — semuanya ditegakkan database, di luar jangkauan aplikasi.
          </p>
        </div>

        <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:mt-10 lg:gap-5 short:mt-7 short:gap-4">
          {TRUST_GUARANTEES.map((item) => (
            <li
              key={item.claim}
              className="flex flex-col rounded-[var(--radius-panel)] bg-white p-7 shadow-[var(--shadow-lift)] lg:p-6 short:p-5"
            >
              <p
                className={`w-fit rounded-full px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] ${ACCENT_BG[item.accent]} ${ACCENT_ON[item.accent]}`}
              >
                {item.where}
              </p>

              <h3 className="mt-5 text-[22px] font-extrabold leading-tight text-ink lg:mt-4 lg:text-xl short:mt-3">
                {item.claim}
              </h3>

              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                {item.detail}
              </p>
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-12 max-w-[54ch] text-center text-[15px] font-bold leading-relaxed text-muted lg:mt-6 short:hidden">
          Setiap poin di atas adalah constraint, policy, trigger, atau hak akses
          yang bisa dibaca di{" "}
          <span className="font-extrabold text-ink">supabase/migrations/</span>.
          Tidak ada yang sekadar janji dari tampilan.
        </p>
      </div>
    </section>
  );
}
