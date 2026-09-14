import Link from "next/link";
import { KosCard } from "@/components/ui/kos-card";
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
    <section id="browse" className="px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
      <div className="mx-auto max-w-[1240px]">
        <p className="eyebrow bg-white text-rose">Se-Indonesia</p>
        <h2 className="mt-6 text-[clamp(2.25rem,5vw,3.5rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-ink">
          Cari kos yang cocok
        </h2>
        <p className="mt-4 text-lg font-medium text-ink-soft" aria-live="polite">
          {kos.length === total
            ? `${total} kos, diurutkan dari ${sortLabel(filter).toLowerCase()}.`
            : `${kos.length} dari ${total} kos cocok dengan filter.`}
        </p>

        <form
          action="/#browse"
          className="mt-10 grid gap-4 rounded-[var(--radius-panel)] bg-white p-5 shadow-[var(--shadow-lift)] sm:grid-cols-2 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto] lg:items-end"
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

          <div className="flex gap-3 sm:col-span-2 lg:col-span-1">
            <button
              type="submit"
              className="flex-1 rounded-full bg-rose px-7 py-3.5 text-[15px] font-extrabold text-white transition-transform hover:-translate-y-0.5 lg:flex-none"
            >
              Terapkan
            </button>
            {filtered && (
              <Link
                href="/#browse"
                className="flex-1 rounded-full bg-cream px-6 py-3.5 text-center text-[15px] font-extrabold text-ink transition-colors hover:bg-cream-deep lg:flex-none"
              >
                Reset
              </Link>
            )}
          </div>
        </form>

        {kos.length > 0 ? (
          <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {kos.map((item) => (
              <KosCard key={item.id} kos={item} />
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-[var(--radius-panel)] bg-white p-10 text-center shadow-[var(--shadow-lift)]">
            <p className="text-xl font-extrabold text-ink">
              Tidak ada kos yang cocok
            </p>
            <p className="mx-auto mt-2 max-w-[40ch] text-[15px] font-medium text-muted">
              Coba kota lain atau naikkan budget. Kalau kamu tahu kos di sini
              yang belum terdaftar, tambahkan lewat peta di atas.
            </p>
            <Link
              href="/#browse"
              className="mt-6 inline-block rounded-full bg-ink px-8 py-3.5 text-[15px] font-extrabold text-white transition-transform hover:-translate-y-0.5"
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

const selectClass =
  "mt-2 w-full cursor-pointer rounded-full border border-cream-deep bg-cream px-5 py-3.5 text-[15px] font-bold text-ink outline-none transition-colors focus:border-rose";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="text-sm font-extrabold text-ink">{label}</span>
      {children}
    </label>
  );
}
