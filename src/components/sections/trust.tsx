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
    <section id="trust" className="px-4 pb-24 sm:px-6 lg:px-10 lg:pb-32">
      <div className="mx-auto max-w-[1160px]">
        <div className="text-center">
          <p className="eyebrow bg-white text-rose">Why trust this</p>

          <h2 className="mx-auto mt-7 max-w-[22ch] text-balance text-[clamp(2.25rem,5vw,3.5rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-ink">
            A review site is only worth its weakest guarantee
          </h2>

          <p className="mx-auto mt-6 max-w-[58ch] text-lg leading-relaxed text-ink-soft">
            The person with the most to gain from bending these numbers is the
            owner of the kos. So none of the rules below live in the interface —
            they live in the database, where nothing in the app can reach past
            them.
          </p>
        </div>

        <ul className="mt-16 grid gap-6 sm:grid-cols-2">
          {TRUST_GUARANTEES.map((item) => (
            <li
              key={item.claim}
              className="flex flex-col rounded-[var(--radius-panel)] bg-white p-7 shadow-[var(--shadow-lift)]"
            >
              <p
                className={`w-fit rounded-full px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] ${ACCENT_BG[item.accent]} ${ACCENT_ON[item.accent]}`}
              >
                {item.where}
              </p>

              <h3 className="mt-5 text-[22px] font-extrabold leading-tight text-ink">
                {item.claim}
              </h3>

              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                {item.detail}
              </p>
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-12 max-w-[54ch] text-center text-[15px] font-bold leading-relaxed text-muted">
          Every one of these is a constraint, a policy, or a trigger you can read
          in{" "}
          <span className="font-extrabold text-ink">supabase/migrations/</span>.
          Nothing here is a promise the front end is keeping on its own.
        </p>
      </div>
    </section>
  );
}
