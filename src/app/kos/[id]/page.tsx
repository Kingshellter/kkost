import Link from "next/link";
import { notFound } from "next/navigation";
import { ReviewForm } from "@/components/review/review-form";
import { ReviewList } from "@/components/review/review-list";
import { Navbar } from "@/components/sections/navbar";
import { buttonClass } from "@/components/ui/controls";
import { KosPhoto } from "@/components/ui/kos-photo";
import { KosScoreBadge } from "@/components/ui/kos-score-badge";
import { CRITERIA } from "@/data/kos";
import { getSessionUser } from "@/lib/auth";
import { formatCampus, formatRupiah } from "@/lib/format";
import { fetchKos, isSupabaseConfigured } from "@/lib/kos-repository";
import { fetchReviews } from "@/lib/review-repository";
import { averageFor } from "@/lib/scores";
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

  // By id, not display name: two tenants can share a name, and a renamed one
  // must not get the form back for a kos they already scored.
  const alreadyReviewed = !!user && reviews.some((r) => r.authorId === user.id);

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

          <header className="mt-6 flex flex-wrap items-start gap-6 rounded-panel bg-white p-4 pb-7 shadow-float sm:p-5 sm:pb-8">
            <KosPhoto
              kos={kos}
              className="h-[200px] w-full rounded-media sm:h-[260px]"
            />
            <div className="min-w-0 flex-1 px-3 sm:px-3">
              <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold leading-[1.05] tracking-[-0.02em] text-ink">
                {kos.name}
              </h1>
              <p className="mt-2 text-[17px] font-medium text-muted">
                {kos.area}, {kos.city}
              </p>
              {kos.campus && (
                <p className="mt-1 text-[15px] font-medium text-muted">
                  {formatCampus(kos.campus, kos.distance)}
                </p>
              )}
              <p className="mt-5 whitespace-nowrap text-[22px] font-extrabold text-ink">
                {formatRupiah(kos.price)}
                <span className="text-base font-medium text-muted"> / bulan</span>
              </p>
            </div>

            <div className="flex flex-col items-center gap-2 px-3">
              <KosScoreBadge kos={kos} size="lg" />
              <p className="text-sm font-bold text-muted">
                {kos.reviews} review
              </p>
            </div>
          </header>

          <ScoreProvenance
            score={kos.score}
            count={kos.reviews}
            demoCount={reviews.filter((r) => r.isDemo).length}
          />

          {reviews.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xl font-extrabold text-ink">
                Rata-rata per fasilitas
              </h2>
              <div className="mt-5 grid gap-4 rounded-panel bg-white p-7 shadow-lift sm:grid-cols-2 sm:gap-x-10">
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
              <div className="rounded-panel bg-white p-8 text-center shadow-lift">
                <p className="text-xl font-extrabold text-ink">
                  Masuk untuk menulis review
                </p>
                <p className="mx-auto mt-2 max-w-[42ch] text-[15px] font-medium text-muted">
                  Satu review per kos, per masa sewa.
                </p>
                <Link
                  href="/#login"
                  className={buttonClass("dark", "md", "mt-6")}
                >
                  Masuk atau daftar
                </Link>
              </div>
            ) : alreadyReviewed ? (
              <div className="rounded-panel bg-white p-8 text-center shadow-lift">
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

/**
 * Spells out where this kos's number came from. The guarantee is real — see
 * refresh_kos_score() in 0002_reviews.sql — but a visitor has no way to know
 * that unless the page says so.
 *
 * `count` is `kos.reviews`, the column the trigger maintains, not the number of
 * review rows fetched: those are the same in normal operation, and using the
 * column keeps this panel agreeing with the score badge above it even on the
 * demo fallback, where the rows are not available.
 */
function ScoreProvenance({
  score,
  count,
  demoCount,
}: {
  score: number;
  count: number;
  /** How many of the fetched reviews came from the seeded demo accounts. */
  demoCount: number;
}) {
  return (
    <aside className="mt-6 rounded-panel border border-cream-deep bg-white/60 px-7 py-6">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
        Dari mana angka ini
      </p>

      {count === 0 ? (
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          Kos ini belum punya skor karena belum ada yang menilainya. Begitu
          review pertama masuk, skornya dihitung otomatis oleh database —
          tidak ada yang bisa menuliskannya sendiri.
        </p>
      ) : (
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          <strong className="font-extrabold text-ink">
            {score.toFixed(1)}
          </strong>{" "}
          adalah rata-rata polos dari {count} review, dihitung ulang oleh
          database setiap kali ada penilaian baru. Aplikasi kkost tidak pernah
          menulis angka ini, dan pemilik kos tidak punya izin menghapus review
          siapa pun.
        </p>
      )}

      {demoCount > 0 && (
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          {demoCount} di antaranya ditulis akun contoh kkost untuk
          demonstrasi, dan diberi label{" "}
          <strong className="font-extrabold text-ink">Review contoh</strong> di
          kartunya.
        </p>
      )}

      <p className="mt-3 text-sm font-medium text-muted">
        Satu review per orang per kos.
      </p>
    </aside>
  );
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
