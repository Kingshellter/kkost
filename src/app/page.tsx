import { Browse } from "@/components/sections/browse";
import { Cta } from "@/components/sections/cta";
import { Hero } from "@/components/sections/hero";
import { Impact } from "@/components/sections/impact";
import { MapSection } from "@/components/sections/map-section";
import { Navbar } from "@/components/sections/navbar";
import { Scoring } from "@/components/sections/scoring";
import { getSessionUser } from "@/lib/auth";
import {
  applyKosFilter,
  cityOptions,
  parseKosFilter,
  summarizeKos,
} from "@/lib/kos-browse";
import {
  fetchKosList,
  isSupabaseConfigured,
  type KosSource,
} from "@/lib/kos-repository";
import { fetchReviews } from "@/lib/review-repository";
import { createClient } from "@/utils/supabase/server";
import type { ConfirmOutcome } from "./auth/confirm/route";

export default async function Home(props: PageProps<"/">) {
  const supabase = isSupabaseConfigured ? await createClient() : null;
  const [{ kos: all, source }, user, params] = await Promise.all([
    fetchKosList(supabase),
    getSessionUser(),
    props.searchParams,
  ]);

  const confirm = parseConfirmOutcome(params.konfirmasi);

  // The map and the browse grid follow the URL filter; the hero's numbers and
  // the city dropdown describe everything, filtered or not.
  const filter = parseKosFilter(params);
  const kos = applyKosFilter(all, filter);
  const cities = cityOptions(all);

  // The hero shows a kos people have actually scored, with its real
  // per-facility averages — not a mock breakdown next to a live name.
  const featured = all.find((item) => item.reviews > 0) ?? all[0];
  const featuredReviews =
    supabase && source === "database" && featured
      ? await fetchReviews(supabase, featured.id)
      : [];

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <DataNotice source={source} />
        {confirm && <ConfirmNotice outcome={confirm} />}
        <Hero
          featured={featured}
          reviews={featuredReviews}
          stats={summarizeKos(all)}
          cities={cities}
          filter={filter}
        />
        <Impact />
        <Scoring />
        <MapSection
          kos={kos}
          signedIn={Boolean(user)}
          filter={filter}
        />
        <Browse kos={kos} total={all.length} cities={cities} filter={filter} />
        <Cta />
      </main>
    </>
  );
}

/**
 * Says so whenever the page is not showing the real database. The demo list
 * carries invented scores, and an outage shows nothing at all; either way a
 * visitor must not mistake what they see for tenant reviews.
 */
function DataNotice({ source }: { source: KosSource }) {
  if (source === "database") return null;

  return (
    <div className="px-4 pt-5 sm:px-6 lg:px-10">
      <p
        role="status"
        className="mx-auto max-w-[1240px] rounded-[22px] bg-amber/15 px-5 py-3.5 text-sm font-medium text-ink"
      >
        {source === "demo" ? (
          <>
            <strong className="font-extrabold">Mode contoh.</strong> Supabase
            belum dikonfigurasi, jadi kos dan skor di halaman ini adalah data
            contoh — bukan review penghuni sungguhan.
          </>
        ) : (
          <>
            <strong className="font-extrabold">
              Database sedang tidak bisa dihubungi.
            </strong>{" "}
            Daftar kos dikosongkan sampai koneksi pulih — kkost tidak pernah
            menggantinya dengan angka karangan.
          </>
        )}
      </p>
    </div>
  );
}

const CONFIRM_TEXT: Record<ConfirmOutcome, string> = {
  berhasil: "Email terkonfirmasi — kamu sudah masuk.",
  masuk:
    "Email sudah terkonfirmasi. Silakan masuk dengan email dan password kamu.",
  gagal:
    "Link konfirmasi tidak valid atau sudah kedaluwarsa. Coba masuk; jika belum bisa, daftar ulang untuk mendapat link baru.",
};

/** `?konfirmasi=` as set by /auth/confirm; anything else is ignored. */
function parseConfirmOutcome(
  value: string | string[] | undefined,
): ConfirmOutcome | null {
  return typeof value === "string" && value in CONFIRM_TEXT
    ? (value as ConfirmOutcome)
    : null;
}

/** The result of clicking the link in the sign-up confirmation email. */
function ConfirmNotice({ outcome }: { outcome: ConfirmOutcome }) {
  return (
    <div className="px-4 pt-5 sm:px-6 lg:px-10">
      <p
        role="status"
        className={`mx-auto max-w-[1240px] rounded-[22px] px-5 py-3.5 text-sm font-bold ${
          outcome === "gagal" ? "bg-rose/10 text-rose" : "bg-blue/10 text-blue"
        }`}
      >
        {CONFIRM_TEXT[outcome]}
      </p>
    </div>
  );
}
