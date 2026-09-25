import { ChevronLeft, MapPin } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { ReviewForm } from "@/components/review/review-form";
import { ReviewList } from "@/components/review/review-list";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";
import { buttonClass } from "@/components/ui/controls";
import { FacilityBar } from "@/components/ui/facility-bar";
import { KosPhoto } from "@/components/ui/kos-photo";
import { KosScoreBadge } from "@/components/ui/kos-score-badge";
import { CRITERIA, type Kos } from "@/data/kos";
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
  return { title: kos ? `${kos.name} · kkost` : "Kos tidak ditemukan · kkost" };
}

/** Everything in the left column on a laptop; the aside takes the right. */
const MAIN_COL = "lg:col-start-1";

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
      <main className="flex-1 px-gutter py-10 lg:py-16">
        {/* DOM order is the phone's reading order: what the kos is, how it
            scores, where the number comes from, what tenants said, then the
            form. From lg the provenance + location aside moves to a sticky
            right column beside the rest. */}
        <div className="mx-auto grid max-w-page gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-x-10">
          <Link
            href="/#browse"
            className={`${MAIN_COL} -ml-1 inline-flex min-h-11 w-fit items-center gap-1 rounded-full pr-2 text-base font-bold text-ink-soft transition-colors duration-(--duration-fast) hover:text-ink active:text-action`}
          >
            <ChevronLeft aria-hidden className="size-5" strokeWidth={2.5} />
            Semua kos
          </Link>

          <header
            className={`${MAIN_COL} -mt-4 rounded-panel bg-white p-4 shadow-float sm:p-5`}
          >
            {/* Shorter on a phone: an illustration carries no information,
                and at 200px it pushed the name and price off the first
                screen. */}
            <KosPhoto
              kos={kos}
              className="h-[140px] w-full rounded-media sm:h-[220px]"
            />

            <div className="flex items-start gap-5 px-2 pb-2 pt-6 sm:px-3">
              <div className="min-w-0 flex-1">
                <h1 className="font-extrabold text-ink text-heading">
                  {kos.name}
                </h1>
                <p className="mt-2 text-base font-medium text-muted">
                  {kos.area}, {kos.city}
                </p>
                {kos.campus && (
                  <p className="mt-0.5 text-sm font-medium text-muted">
                    {formatCampus(kos.campus, kos.distance)}
                  </p>
                )}
                <p className="mt-4 text-2xl font-extrabold text-ink">
                  {formatRupiah(kos.price)}
                  <span className="text-base font-medium text-muted"> / bulan</span>
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-center gap-2">
                <KosScoreBadge kos={kos} size="lg" />
                <p className="text-sm font-bold text-muted">
                  {kos.reviews} review
                </p>
              </div>
            </div>

            {/* The form sits under every review; this is the way to it.
                Gone once the visitor has already scored this kos. One short
                label either way: "Masuk untuk menulis" wrapped to two lines
                in a half-width phone button, and the section it lands on
                already says that signing in comes first. */}
            <div className="mt-4 flex gap-3 px-2 pb-1 sm:px-3">
              {!alreadyReviewed && (
                <a href="#tulis-review" className={buttonClass("primary", "md", "flex-1 px-4! sm:flex-none sm:px-7!")}>
                  Tulis review
                </a>
              )}
              <a href="#lokasi" className={buttonClass("soft", "md", "flex-1 px-4! sm:flex-none sm:px-7!")}>
                Lihat lokasi
              </a>
            </div>
          </header>

          {reviews.length > 0 && (
            <section className={MAIN_COL}>
              <h2 className="text-xl font-extrabold text-ink">
                Rata-rata per fasilitas
              </h2>
              {/* The same bar as the hero card, so one number never looks
                  like two different things on two pages. */}
              <div className="mt-4 space-y-3.5 rounded-panel bg-white p-6 shadow-lift sm:p-7">
                {CRITERIA.map((c) => {
                  const value = averageFor(reviews, c.key);
                  return (
                    <div key={c.key} className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <FacilityBar label={c.title} score={value} accent={c.accent} />
                      </div>
                      <span className="w-8 text-right text-base font-extrabold tabular-nums text-ink">
                        {value.toFixed(1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <aside className="flex flex-col gap-5 lg:sticky lg:top-8 lg:col-start-2 lg:row-span-5 lg:row-start-1 lg:self-start">
            <ScoreProvenance
              score={kos.score}
              count={kos.reviews}
              demoCount={reviews.filter((r) => r.isDemo).length}
            />
            <KosLocation kos={kos} />
          </aside>

          <section id="ulasan" className={`${MAIN_COL} scroll-mt-24 lg:scroll-mt-8`}>
            <h2 className="text-xl font-extrabold text-ink">
              {reviews.length} review dari penghuni
            </h2>
            <div className="mt-4">
              <ReviewList reviews={reviews} />
            </div>
          </section>

          <section id="tulis-review" className={`${MAIN_COL} scroll-mt-24 lg:scroll-mt-8`}>
            {!user ? (
              // Signing in here, not on the homepage: the action revalidates
              // the whole layout, so this page renders again with a user and
              // the review form takes the card's place. The visitor never
              // loses the kos they were reading.
              // Side by side from md: a lone 460px card in an 820px column
              // left half the row empty.
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)] md:items-start md:gap-8">
                <div className="md:pt-2">
                  <h2 className="text-xl font-extrabold text-ink">
                    Masuk untuk menulis review
                  </h2>
                  <p className="mt-1 max-w-[52ch] text-base text-ink-soft">
                    Satu review per kos, per masa sewa. Setelah masuk, form
                    penilaian muncul di sini.
                  </p>
                </div>
                <AuthCard />
              </div>
            ) : (
              // One component for "write", "saved" and "already reviewed":
              // the review action revalidates this page, and swapping
              // branches here would unmount the form before it could say
              // the review was saved.
              <ReviewForm kosId={kos.id} alreadyReviewed={alreadyReviewed} />
            )}
          </section>
        </div>
      </main>
      <Footer />
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
    <section className="rounded-panel border border-cream-deep bg-white/60 p-6">
      <h2 className="text-base font-extrabold text-ink">Dari mana angka ini</h2>

      {count === 0 ? (
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Kos ini belum punya skor karena belum ada yang menilainya. Begitu
          review pertama masuk, skornya dihitung otomatis oleh database. Tidak
          ada yang bisa menuliskannya sendiri.
        </p>
      ) : (
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
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
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {demoCount} di antaranya ditulis akun contoh kkost untuk
          demonstrasi, dan diberi label{" "}
          <strong className="font-extrabold text-ink">Review contoh</strong> di
          kartunya.
        </p>
      )}

      <p className="mt-3 text-sm font-medium text-muted">
        Satu review per orang per kos.
      </p>
    </section>
  );
}

/**
 * Where the kos is, as links rather than a map: a second Leaflet instance on
 * every detail page would cost a script and a tile load, and on a phone it
 * would need the scroll lock all over again. OpenStreetMap opens at the kos's
 * own coordinates; the kkost link shows it among the other kos in its city.
 */
function KosLocation({ kos }: { kos: Kos }) {
  const [lat, lng] = kos.coords;
  const osm = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`;

  return (
    <section
      id="lokasi"
      className="scroll-mt-24 rounded-panel bg-white p-6 shadow-lift lg:scroll-mt-8"
    >
      <h2 className="flex items-center gap-2 text-base font-extrabold text-ink">
        <MapPin aria-hidden className="size-5 text-action" strokeWidth={2} />
        Lokasi
      </h2>
      <p className="mt-2 text-base font-medium text-ink">
        {kos.area}, {kos.city}
      </p>
      {kos.campus && (
        <p className="mt-0.5 text-sm font-medium text-muted">
          {formatCampus(kos.campus, kos.distance)}
        </p>
      )}
      <div className="mt-4 grid gap-2">
        <a
          href={osm}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass("soft", "sm", "w-full")}
        >
          Buka di OpenStreetMap
        </a>
        <Link
          href={`/?kota=${encodeURIComponent(kos.city)}#peta`}
          className={buttonClass("soft", "sm", "w-full")}
        >
          Lihat di peta kkost
        </Link>
      </div>
    </section>
  );
}
