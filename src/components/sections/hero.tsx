import Link from "next/link";
import { BoundaryCircle, SEAMS } from "@/components/ui/boundary-circle";
import { buttonClass } from "@/components/ui/controls";
import { FacilityBar } from "@/components/ui/facility-bar";
import { KosPhoto } from "@/components/ui/kos-photo";
import { KosScoreBadge } from "@/components/ui/kos-score-badge";
import {
  LOAD_GROW,
  LOAD_POP,
  LOAD_RISE,
  step,
} from "@/components/ui/reveal-classes";
import { CRITERIA, type Kos, type Review } from "@/data/kos";
import { formatCampus, formatNumber, formatRupiah } from "@/lib/format";
import { BUDGETS, type KosFilter } from "@/lib/kos-browse";
import { averageFor } from "@/lib/scores";

type Props = {
  /** Undefined only when there is no kos at all to feature. */
  featured: Kos | undefined;
  /** The featured kos's reviews, newest first. Empty on the demo fallback. */
  reviews: Review[];
  stats: { reviews: number; kos: number; cities: number };
  cities: string[];
  filter: KosFilter;
};

/**
 * The first screen. Its entrance plays on page load (LOAD_* classes, from
 * `@starting-style`): the amber blob grows, then eyebrow, headline,
 * subline, search and the featured card rise one beat apart, and the quote
 * bubble grows last.
 */
export function Hero({ featured, reviews, stats, cities, filter }: Props) {
  // On a laptop hero + navbar fill exactly one screen; 5.5rem is the navbar.
  return (
    <section className="relative overflow-hidden px-gutter pb-section pt-14 lg:flex lg:min-h-[calc(100svh-5.5rem)] lg:flex-col lg:justify-center lg:py-12">
      {/* Decorative blobs from the deck */}
      <div
        aria-hidden
        style={step(0)}
        className={`pointer-events-none absolute -right-40 top-10 h-[300px] w-[300px] rounded-full bg-amber lg:-right-44 lg:top-10 lg:h-[540px] lg:w-[540px] ${LOAD_GROW}`}
      />
      <BoundaryCircle edge="bottom" circle={SEAMS.heroImpact} />

      <div className="relative mx-auto grid w-full max-w-page items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,480px)]">
        <div>
          {/* The page's only eyebrow. Real counts, as a sentence rather than
              a dotted strip. */}
          <p
            style={step(1)}
            className={`eyebrow bg-white text-action shadow-lift ${LOAD_RISE}`}
          >
            {formatNumber(stats.reviews)} review dari {formatNumber(stats.kos)}{" "}
            kos di {formatNumber(stats.cities)} kota
          </p>

          {/* Phrases kept whole instead of <br>s: the lines break where the
              sentence does. The display sizes are set so "orang yang
              pernah" fits from a 320px phone to the split layout at 1024. */}
          <h1
            style={step(2)}
            className={`mt-8 font-extrabold text-ink text-display lg:text-display-split ${LOAD_RISE}`}
          >
            Pilih kos dari{" "}
            <span className="whitespace-nowrap">orang yang pernah</span>{" "}
            <span className="whitespace-nowrap">
              <span className="text-rose">tinggal di sana</span>.
            </span>
          </h1>

          <p
            style={step(3)}
            className={`mt-7 max-w-[34ch] text-lg leading-relaxed text-ink-soft sm:max-w-[48ch] ${LOAD_RISE}`}
          >
            {/* The problem first: a judge should get it in the first ten
                seconds. No claim that reviewers are verified tenants — only
                a .ac.id address is checked, and that is not proof of rent.
                Short on purpose: a hero subline past ~20 words stops being
                read. */}
            <strong className="font-extrabold text-ink">
              Iklan kos ditulis pemiliknya.
            </strong>{" "}
            Di kkost, penghuni menilai enam fasilitas satu per satu, dan tidak
            ada yang bisa menghapus review orang lain.
          </p>

          {/* Same GET contract as the browse filter: lands on /?kota=…#browse. */}
          <form
            action="/#browse"
            style={step(4)}
            className={`${LOAD_RISE} mt-10 flex max-w-[620px] flex-col gap-3 rounded-panel bg-white p-3 shadow-lift sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:py-2.5 sm:pl-3 sm:pr-2.5`}
          >
            <label className={fieldClass}>
              <span className="shrink-0 text-sm font-bold text-muted">
                Kota
              </span>
              <select
                name="kota"
                defaultValue={filter.city ?? ""}
                className={selectClass}
              >
                <option value="">Semua kota</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>

            <label className={fieldClass}>
              <span className="shrink-0 text-sm font-bold text-muted">
                Budget
              </span>
              <select
                name="harga"
                defaultValue={filter.maxPrice?.toString() ?? ""}
                className={selectClass}
              >
                <option value="">Berapa saja</option>
                {BUDGETS.map((budget) => (
                  <option key={budget} value={budget}>
                    ≤ {formatRupiah(budget)}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              className={buttonClass("primary", "md", "shrink-0 px-8!")}
            >
              Cari
            </button>
          </form>
        </div>

        {featured && <HeroCard kos={featured} reviews={reviews} />}
      </div>
    </section>
  );
}

// Borderless on purpose: the whole pill is the field. 16px, or iOS zooms in.
// The bare select would draw its focus ring tight around its text, so the
// label draws it instead, round like the pill, and darkens a touch on hover.
const fieldClass =
  "focus-ring-within flex min-w-0 flex-1 items-center gap-3 rounded-full px-3 transition-colors duration-(--duration-fast) hover:bg-cream";
const selectClass =
  "min-w-0 flex-1 cursor-pointer bg-transparent py-3 text-base font-bold text-ink focus-visible:outline-none";

/**
 * The featured kos with its real per-facility averages and newest written
 * review. Falls back to the kos's own highlights only on the demo list, where
 * no review rows exist.
 */
function HeroCard({ kos, reviews }: { kos: Kos; reviews: Review[] }) {
  const bars = reviews.length
    ? CRITERIA.map((c) => ({
        label: c.title,
        score: averageFor(reviews, c.key),
        accent: c.accent,
      }))
    : kos.highlights;
  const quote = reviews.find((review) => review.body);

  return (
    <div
      style={step(5)}
      className={`relative mx-auto w-full max-w-[480px] lg:mx-0 ${LOAD_RISE}`}
    >
      <article className="rounded-panel bg-white p-7 shadow-float">
        <div className="flex items-start gap-4">
          {/* Decoration, not information: on a phone it squeezed the
              location into three lines between itself and the score. */}
          <KosPhoto
            kos={kos}
            showLabel={false}
            className="size-[68px] shrink-0 rounded-full max-sm:hidden"
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-extrabold leading-tight text-ink sm:text-2xl">
              <Link href={`/kos/${kos.id}`} className="transition-colors hover:text-action active:text-action">
                {kos.name}
              </Link>
            </h2>
            <p className="mt-1 text-sm font-medium text-muted">
              {kos.area}, {kos.city}
              {kos.campus && `, ${formatCampus(kos.campus, kos.distance)}`}
            </p>
          </div>
          <KosScoreBadge kos={kos} size="lg" />
        </div>

        {bars.length > 0 ? (
          <div className="mt-7 space-y-3.5">
            {bars.map((item) => (
              <FacilityBar key={item.label} {...item} />
            ))}
          </div>
        ) : (
          <p className="mt-7 text-base font-medium text-muted">
            Belum ada review untuk kos ini.
          </p>
        )}

        <div className="mt-7 flex items-baseline justify-between border-t border-cream-deep pt-5">
          <p className="text-2xl font-extrabold text-ink">
            {formatRupiah(kos.price)}
            <span className="text-base font-medium text-muted"> / bulan</span>
          </p>
          <p className="text-sm font-medium text-muted">
            {kos.reviews} review
          </p>
        </div>
      </article>

      {quote?.body && (
        <figure
          style={step(9)}
          className={`relative -mt-6 ml-2 w-fit max-w-[320px] origin-top-left rounded-media bg-blue px-5 py-4 shadow-lift sm:-ml-6 ${LOAD_POP}`}
        >
          <blockquote className="line-clamp-3 text-base font-bold leading-snug text-white">
            &ldquo;{quote.body}&rdquo;
          </blockquote>
          {/* White at 90%, not 75%: 75% on blue was 3.9:1, under AA for
              text this small (Fase 7c). Still a step quieter than the quote. */}
          <figcaption className="mt-2 text-sm font-bold text-white/90">
            {quote.authorName}
            {quote.isDemo && " (review contoh)"}
          </figcaption>
        </figure>
      )}
    </div>
  );
}
