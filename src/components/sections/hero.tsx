import Link from "next/link";
import { FacilityBar } from "@/components/ui/facility-bar";
import { KosPhoto } from "@/components/ui/kos-photo";
import { KosScoreBadge } from "@/components/ui/kos-score-badge";
import { CRITERIA, type Kos, type Review } from "@/data/kos";
import { formatDistance, formatNumber, formatRupiah } from "@/lib/format";
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

export function Hero({ featured, reviews, stats, cities, filter }: Props) {
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
            {formatNumber(stats.reviews)} review · {formatNumber(stats.kos)} kos
            · {formatNumber(stats.cities)} kota
          </p>

          <h1 className="mt-8 text-[clamp(2.5rem,6.5vw,4.25rem)] font-extrabold leading-[1] tracking-[-0.035em] text-ink">
            Pilih kos dari
            <br />
            orang yang pernah
            <br />
            <span className="text-rose">tinggal di sana</span>.
          </h1>

          <p className="mt-7 max-w-[34ch] text-lg leading-relaxed text-ink-soft sm:max-w-[48ch]">
            {/* The problem first: a judge should get it in the first ten
                seconds. No claim that reviewers are verified tenants — only
                a .ac.id address is checked, and that is not proof of rent. */}
            <strong className="font-extrabold text-ink">
              Iklan kos ditulis pemiliknya.
            </strong>{" "}
            Di kkost, penghuni menilai enam fasilitas satu per satu — air, WiFi,
            kamar mandi, sampai parkir — di seluruh Indonesia. Tidak ada yang
            bisa menghapus review orang lain, termasuk pemilik kos.
          </p>

          {/* Same GET contract as the browse filter: lands on /?kota=…#browse. */}
          <form
            action="/#browse"
            className="mt-10 flex max-w-[620px] flex-col gap-3 rounded-[32px] bg-white p-3 shadow-[var(--shadow-lift)] sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:py-2.5 sm:pl-6 sm:pr-2.5"
          >
            <label className="flex min-w-0 flex-1 items-center gap-3 px-3 sm:px-0">
              <span className="shrink-0 text-[15px] font-bold text-muted">
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

            <span
              aria-hidden
              className="hidden h-7 w-px shrink-0 bg-cream-deep sm:block"
            />

            <label className="flex min-w-0 flex-1 items-center gap-3 px-3 sm:px-5">
              <span className="shrink-0 text-[15px] font-bold text-muted">
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
              className="shrink-0 rounded-full bg-rose px-8 py-3.5 text-[15px] font-extrabold text-white transition-transform hover:-translate-y-0.5"
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

const selectClass =
  "min-w-0 flex-1 cursor-pointer bg-transparent py-2 text-[15px] font-bold text-ink outline-none";

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
    <div className="relative mx-auto w-full max-w-[480px] lg:mx-0">
      <article className="rounded-[var(--radius-panel)] bg-white p-7 shadow-[var(--shadow-float)]">
        <div className="flex items-start gap-4">
          <KosPhoto
            kos={kos}
            showLabel={false}
            sizes="68px"
            className="h-[68px] w-[68px] shrink-0 rounded-full"
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-[22px] font-extrabold leading-tight text-ink">
              <Link href={`/kos/${kos.id}`} className="hover:text-rose">
                {kos.name}
              </Link>
            </h2>
            <p className="mt-1 text-[15px] font-medium text-muted">
              {kos.area}, {kos.city}
              {kos.campus && ` · ${formatDistance(kos.distance)} ke ${kos.campus}`}
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
          <p className="mt-7 text-[15px] font-medium text-muted">
            Belum ada review untuk kos ini.
          </p>
        )}

        <div className="mt-7 flex items-baseline justify-between border-t border-cream-deep pt-5">
          <p className="text-[22px] font-extrabold text-ink">
            {formatRupiah(kos.price)}
            <span className="text-base font-medium text-muted"> / bulan</span>
          </p>
          <p className="text-[15px] font-medium text-muted">
            {kos.reviews} review
          </p>
        </div>
      </article>

      {quote?.body && (
        <figure className="relative -mt-6 ml-2 w-fit max-w-[320px] rounded-[22px] bg-blue px-5 py-4 shadow-[var(--shadow-lift)] sm:-ml-6">
          <blockquote className="line-clamp-3 text-[15px] font-bold leading-snug text-white">
            &ldquo;{quote.body}&rdquo;
          </blockquote>
          <figcaption className="mt-2 text-xs font-bold text-white/75">
            {quote.authorName}
            {quote.isDemo && " · review contoh"}
          </figcaption>
        </figure>
      )}
    </div>
  );
}
