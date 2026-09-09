import Link from "next/link";
import { notFound } from "next/navigation";
import { ReviewForm } from "@/components/review/review-form";
import { ReviewList } from "@/components/review/review-list";
import { Navbar } from "@/components/sections/navbar";
import { ScoreBadge } from "@/components/ui/score-badge";
import { accentForScore } from "@/components/ui/accent";
import { CRITERIA, type FacilityKey } from "@/data/kos";
import { getSessionUser } from "@/lib/auth";
import { formatDistance, formatRupiah } from "@/lib/format";
import { fetchKos, isSupabaseConfigured } from "@/lib/kos-repository";
import { fetchReviews } from "@/lib/review-repository";
import { createClient } from "@/utils/supabase/server";

export async function generateMetadata(props: PageProps<"/kos/[id]">) {
  const { id } = await props.params;
  const supabase = isSupabaseConfigured ? await createClient() : null;
  const kos = await fetchKos(supabase, id);
  return { title: kos ? `${kos.name} — kkost` : "Kos tidak ditemukan — kkost" };
}

export default async function KosDetail(props: PageProps<"/kos/[id]">) {
  const { id } = await props.params;
  const supabase = isSupabaseConfigured ? await createClient() : null;

  const [kos, reviews, user] = await Promise.all([
    fetchKos(supabase, id),
    supabase ? fetchReviews(supabase, id) : Promise.resolve([]),
    getSessionUser(),
  ]);

  if (!kos) notFound();

  const alreadyReviewed = reviews.some((r) => r.authorName === user?.displayName);

  return (
    <>
      <Navbar />
      <main className="flex-1 px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-[1000px]">
          <Link
            href="/#browse"
            className="text-[15px] font-bold text-muted transition-colors hover:text-ink"
          >
            ← Semua kos
          </Link>

          <header className="mt-6 flex flex-wrap items-start gap-6 rounded-[var(--radius-panel)] bg-white p-7 shadow-[var(--shadow-float)] sm:p-8">
            <div className="min-w-0 flex-1">
              <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold leading-[1.05] tracking-[-0.02em] text-ink">
                {kos.name}
              </h1>
              <p className="mt-2 text-[17px] font-medium text-muted">
                {kos.area}, {kos.city}
              </p>
              {kos.campus && (
                <p className="mt-1 text-[15px] font-medium text-muted">
                  {formatDistance(kos.distance)} ke {kos.campus}
                </p>
              )}
              <p className="mt-5 text-[22px] font-extrabold text-ink">
                {formatRupiah(kos.price)}
                <span className="text-base font-medium text-muted"> / bulan</span>
              </p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <ScoreBadge
                score={kos.score}
                size="lg"
                accent={kos.reviews === 0 ? "ink" : accentForScore(kos.score)}
                label={kos.reviews === 0 ? "Baru" : undefined}
              />
              <p className="text-sm font-bold text-muted">
                {kos.reviews} review
              </p>
            </div>
          </header>

          {reviews.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xl font-extrabold text-ink">
                Rata-rata per fasilitas
              </h2>
              <div className="mt-5 grid gap-4 rounded-[var(--radius-panel)] bg-white p-7 shadow-[var(--shadow-lift)] sm:grid-cols-2 sm:gap-x-10">
                {CRITERIA.map((c) => (
                  <FacilityAverage
                    key={c.key}
                    label={c.title}
                    value={averageFor(reviews, c.key)}
                  />
                ))}
              </div>
            </section>
          )}

          <section className="mt-12">
            <h2 className="text-xl font-extrabold text-ink">
              {reviews.length} review dari penghuni
            </h2>
            <div className="mt-5">
              <ReviewList reviews={reviews} />
            </div>
          </section>

          <section className="mt-12">
            {!user ? (
              <div className="rounded-[var(--radius-panel)] bg-white p-8 text-center shadow-[var(--shadow-lift)]">
                <p className="text-xl font-extrabold text-ink">
                  Masuk untuk menulis review
                </p>
                <p className="mx-auto mt-2 max-w-[42ch] text-[15px] font-medium text-muted">
                  Satu review per kos, per masa sewa. Bisa diedit selama 30 hari.
                </p>
                <Link
                  href="/#login"
                  className="mt-6 inline-block rounded-full bg-ink px-8 py-3.5 text-[15px] font-extrabold text-white transition-transform hover:-translate-y-0.5"
                >
                  Masuk atau daftar
                </Link>
              </div>
            ) : alreadyReviewed ? (
              <div className="rounded-[var(--radius-panel)] bg-white p-8 text-center shadow-[var(--shadow-lift)]">
                <p className="text-xl font-extrabold text-ink">
                  Kamu sudah menilai kos ini
                </p>
                <p className="mx-auto mt-2 max-w-[42ch] text-[15px] font-medium text-muted">
                  Satu review per kos, per masa sewa.
                </p>
              </div>
            ) : (
              <ReviewForm kosId={kos.id} />
            )}
          </section>
        </div>
      </main>
    </>
  );
}

function averageFor(
  reviews: { scores: Record<FacilityKey, number> }[],
  key: FacilityKey,
) {
  const sum = reviews.reduce((acc, r) => acc + r.scores[key], 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

function FacilityAverage({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-cream-deep pb-3 last:border-0">
      <span className="text-[15px] font-bold text-ink">{label}</span>
      <span className="text-[17px] font-extrabold tabular-nums text-ink">
        {value.toFixed(1)}
      </span>
    </div>
  );
}
