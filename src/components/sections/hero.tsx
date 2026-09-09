import { FacilityBar } from "@/components/ui/facility-bar";
import { KosScoreBadge } from "@/components/ui/kos-score-badge";
import { HERO_BREAKDOWN, STATS, type Kos } from "@/data/kos";
import { formatDistance, formatRupiah } from "@/lib/format";

export function Hero({ featured }: { featured: Kos }) {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-14 sm:px-6 lg:px-10 lg:pb-32 lg:pt-20">
      {/* Decorative blobs from the deck */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-28 -top-48 h-[300px] w-[300px] rounded-full bg-amber lg:-right-10 lg:-top-40 lg:h-[620px] lg:w-[620px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-56 -left-40 h-[420px] w-[420px] rounded-full bg-lavender"
      />

      <div className="relative mx-auto grid max-w-[1240px] items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:gap-10">
        <div>
          <p className="eyebrow bg-white text-rose shadow-[var(--shadow-lift)]">
            <span className="h-2 w-2 rounded-full bg-rose" />
            {STATS.reviews.toLocaleString("en-US")} reviews ·{" "}
            {STATS.kos.toLocaleString("en-US")} kos · {STATS.cities} kota
          </p>

          <h1 className="mt-8 text-[clamp(2.75rem,7vw,4.5rem)] font-extrabold leading-[0.98] tracking-[-0.035em] text-ink">
            Choose your kos
            <br />
            from the people
            <br />
            who <span className="text-rose">lived in it</span>.
          </h1>

          <p className="mt-7 max-w-[30ch] text-lg leading-relaxed text-ink-soft sm:max-w-[46ch]">
            Six facilities, scored one by one by students who paid the rent,
            in every city in Indonesia. Owners can reply — they can never
            delete.
          </p>

          <form
            className="mt-10 flex max-w-[600px] flex-col gap-3 rounded-[32px] bg-white p-3 shadow-[var(--shadow-lift)] sm:flex-row sm:items-center sm:rounded-full sm:gap-0 sm:py-2.5 sm:pl-6 sm:pr-2.5"
            action="#browse"
          >
            <label className="flex min-w-0 flex-1 items-baseline gap-3 px-3 sm:px-0">
              <span className="shrink-0 text-[15px] font-bold text-muted">
                Kota
              </span>
              <input
                name="city"
                placeholder="Semua kota di Indonesia"
                aria-label="Kota"
                className="min-w-0 flex-1 bg-transparent text-[15px] font-bold text-ink outline-none placeholder:text-muted"
              />
            </label>

            <span
              aria-hidden
              className="hidden h-7 w-px shrink-0 bg-cream-deep sm:block"
            />

            <label className="flex min-w-0 flex-1 items-baseline px-3 sm:px-5">
              <span className="sr-only">Budget maksimum</span>
              <input
                name="budget"
                defaultValue="Under Rp1,200,000"
                className="min-w-0 flex-1 bg-transparent text-[15px] font-bold text-muted outline-none"
              />
            </label>

            <button
              type="submit"
              className="shrink-0 rounded-full bg-rose px-8 py-3.5 text-[15px] font-extrabold text-white transition-transform hover:-translate-y-0.5"
            >
              Search
            </button>
          </form>
        </div>

        <HeroCard kos={featured} />
      </div>
    </section>
  );
}

function HeroCard({ kos }: { kos: Kos }) {
  return (
    <div className="relative mx-auto w-full max-w-[480px] lg:mx-0">
      <article className="rounded-[var(--radius-panel)] bg-white p-7 shadow-[var(--shadow-float)]">
        <div className="flex items-start gap-4">
          <span className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-full bg-sky text-[11px] font-extrabold tracking-[0.16em] text-ink/60">
            PHOTO
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[22px] font-extrabold leading-tight text-ink">
              {kos.name}
            </h2>
            <p className="mt-1 text-[15px] font-medium text-muted">
              {kos.area}, {kos.city}
              {kos.campus && ` · ${formatDistance(kos.distance)} ke ${kos.campus}`}
            </p>
          </div>
          <KosScoreBadge kos={kos} size="lg" />
        </div>

        <div className="mt-7 space-y-3.5">
          {HERO_BREAKDOWN.map((item) => (
            <FacilityBar key={item.label} {...item} />
          ))}
        </div>

        <div className="mt-7 flex items-baseline justify-between border-t border-cream-deep pt-5">
          <p className="text-[22px] font-extrabold text-ink">
            {formatRupiah(kos.price)}
            <span className="text-base font-medium text-muted"> / month</span>
          </p>
          <p className="text-[15px] font-medium text-muted">
            {kos.reviews} reviews
          </p>
        </div>
      </article>

      <figure className="relative -mt-6 ml-2 w-fit max-w-[290px] rounded-[22px] bg-blue px-5 py-4 shadow-[var(--shadow-lift)] sm:-ml-6">
        <blockquote className="text-[15px] font-bold leading-snug text-white">
          &ldquo;The water has never once cut out.&rdquo;
        </blockquote>
      </figure>
    </div>
  );
}
