import { ChevronDown, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { BoundaryCircle, SEAMS } from "@/components/ui/boundary-circle";
import {
  buttonClass,
  LABEL_CLASS,
  SELECT_CLASS,
} from "@/components/ui/controls";
import { KosCard } from "@/components/ui/kos-card";
import { KosCarousel } from "@/components/ui/kos-carousel";
import type { Kos } from "@/data/kos";
import { formatRupiah } from "@/lib/format";
import { BUDGETS, SORTS, hasFilter, type KosFilter } from "@/lib/kos-browse";

type Props = {
  /** Already filtered and sorted by the page. */
  kos: Kos[];
  /** Size of the unfiltered list, for "3 dari 11 kos". */
  total: number;
  cities: string[];
  filter: KosFilter;
};

/**
 * The browse grid and its filter bar. The form is a plain GET form aimed at
 * `/#browse`, so applying a filter is a server render of the same page: no
 * client state, works without JavaScript, and the resulting URL can be shared.
 */
export function Browse({ kos, total, cities, filter }: Props) {
  const filtered = hasFilter(filter);

  return (
    <section
      id="browse"
      className="relative scroll-mt-24 overflow-hidden px-gutter py-section lg:scroll-mt-0 lg:flex lg:min-h-svh lg:flex-col lg:justify-center lg:py-12 short:py-7"
    >
      <BoundaryCircle edge="top" circle={SEAMS.mapBrowse} />
      <BoundaryCircle edge="bottom" circle={SEAMS.browseCta} />

      <div className="relative mx-auto w-full max-w-page">
        <h2 className="font-extrabold text-ink text-title">
          Cari kos yang cocok
        </h2>
        <p className="mt-4 text-lg font-medium text-ink-soft lg:mt-3" aria-live="polite">
          {kos.length === total
            ? `${total} kos, diurutkan dari ${sortLabel(filter).toLowerCase()}.`
            : `${kos.length} dari ${total} kos cocok dengan filter.`}
        </p>

        {/* Below lg the filter folds behind one button, so the first card is
            not 400px down a phone. A checkbox and `peer-checked:` do the
            folding: no JavaScript, like the GET form itself. It starts open
            whenever a filter is set, so the visitor sees what is applied. */}
        <input
          type="checkbox"
          id="filter-toggle"
          defaultChecked={filtered}
          className="peer sr-only"
        />
        <label
          htmlFor="filter-toggle"
          className="mt-8 flex w-full cursor-pointer select-none items-center gap-3 rounded-panel bg-white px-5 py-4 shadow-lift transition-[scale] duration-(--duration-fast) ease-out active:scale-(--press-scale-surface) active:duration-(--duration-press) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus peer-checked:[&_.chevron]:rotate-180 lg:hidden"
        >
          <SlidersHorizontal aria-hidden className="size-5 shrink-0 text-ink" strokeWidth={2} />
          <span className="min-w-0 flex-1">
            <span className="block text-base font-extrabold text-ink">
              Filter &amp; urutkan
            </span>
            <span className="line-clamp-2 text-sm font-medium text-muted">
              {filterSummary(filter)}
            </span>
          </span>
          <ChevronDown
            aria-hidden
            className="chevron size-5 shrink-0 text-muted transition-transform duration-(--duration-base) ease-in-out motion-reduce:transition-none"
            strokeWidth={2}
          />
        </label>

        <form
          action="/#browse"
          className="mt-3 hidden gap-4 rounded-panel bg-white p-5 shadow-lift peer-checked:grid sm:grid-cols-3 lg:mt-7 lg:grid lg:grid-cols-[repeat(3,minmax(0,1fr))_auto] lg:items-end short:mt-5 short:p-4"
        >
          <Field label="Kota">
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
          </Field>

          <Field label="Budget per bulan">
            <select
              name="harga"
              defaultValue={filter.maxPrice?.toString() ?? ""}
              className={selectClass}
            >
              <option value="">Berapa saja</option>
              {BUDGETS.map((budget) => (
                <option key={budget} value={budget}>
                  Sampai {formatRupiah(budget)}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Urutkan">
            <select name="urut" defaultValue={filter.sort} className={selectClass}>
              {SORTS.map((sort) => (
                <option key={sort.value} value={sort.value}>
                  {sort.label}
                </option>
              ))}
            </select>
          </Field>

          <div className="flex gap-3 sm:col-span-3 lg:col-span-1">
            <button
              type="submit"
              className={buttonClass("primary", "md", "flex-1 lg:flex-none")}
            >
              Terapkan
            </button>
            {filtered && (
              <Link
                href="/#browse"
                className={buttonClass("soft", "md", "flex-1 lg:flex-none")}
              >
                Reset
              </Link>
            )}
          </div>
        </form>

        {kos.length > 0 ? (
          <div className="mt-8 lg:mt-5 short:mt-3">
            <KosCarousel label={`${kos.length} kos`}>
              {kos.map((item) => (
                <KosCard key={item.id} kos={item} />
              ))}
            </KosCarousel>
          </div>
        ) : (
          <div className="mt-12 rounded-panel bg-white p-10 text-center shadow-lift">
            <p className="text-xl font-extrabold text-ink">
              Tidak ada kos yang cocok
            </p>
            <p className="mx-auto mt-2 max-w-[40ch] text-base font-medium text-muted">
              Coba kota lain atau naikkan budget. Kalau kamu tahu kos di sini
              yang belum terdaftar, tambahkan lewat peta di atas.
            </p>
            <Link
              href="/#browse"
              className={buttonClass("dark", "md", "mt-6")}
            >
              Hapus filter
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function sortLabel(filter: KosFilter) {
  return SORTS.find((sort) => sort.value === filter.sort)?.label ?? "";
}

/** "Semua kota, berapa saja, skor tertinggi": what the folded filter holds. */
function filterSummary(filter: KosFilter) {
  return [
    filter.city ?? "Semua kota",
    filter.maxPrice ? `sampai ${formatRupiah(filter.maxPrice)}` : "berapa saja",
    sortLabel(filter).toLowerCase(),
  ].join(", ");
}

const selectClass = SELECT_CLASS;

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className={LABEL_CLASS}>{label}</span>
      {children}
    </label>
  );
}
