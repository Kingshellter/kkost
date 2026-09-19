import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { Logo } from "@/components/ui/logo";
import { getSessionUser } from "@/lib/auth";

export async function Cta() {
  const user = await getSessionUser();

  return (
    <section
      id="login"
      className="relative overflow-hidden bg-amber px-4 py-24 sm:px-6 lg:px-10 lg:py-32"
    >
      {/* Decorative ring + blob from the deck */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-[22%] h-64 w-64 rounded-full border-[22px] border-black/[0.06]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-24 h-[420px] w-[420px] rounded-full bg-amber-soft"
      />

      <div className="relative mx-auto grid max-w-[1240px] items-center gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)]">
        <div>
          <p className="eyebrow bg-ink text-amber">
            {user ? "Kamu sudah masuk" : "Masuk untuk menulis"}
          </p>

          <h2 className="mt-7 text-[clamp(2.25rem,5.5vw,3.75rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-ink">
            Pernah ngekos?
            <br />
            Ceritakan.
          </h2>

          <p className="mt-7 max-w-[44ch] text-lg leading-relaxed text-ink">
            Lima menit darimu bisa menyelamatkan mahasiswa berikutnya dari
            setahun yang buruk. Satu review per kos, per orang.
          </p>

          <div className="mt-14 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Logo />
            {/* The separator dot only makes sense on one line; on a phone
                the tagline wraps under the logo, where it would dangle. */}
            <p className="text-[15px] font-bold text-ink">
              <span aria-hidden className="hidden sm:inline">
                ·{" "}
              </span>
              Gratis mencari, gratis menilai. Seluruh Indonesia.
            </p>
          </div>
        </div>

        {user ? <SignedInCard name={user.displayName} isStudent={user.isStudent} /> : <AuthCard />}
      </div>
    </section>
  );
}

function SignedInCard({
  name,
  isStudent,
}: {
  name: string;
  isStudent: boolean;
}) {
  return (
    <div className="rounded-[var(--radius-panel)] bg-white p-8 shadow-[var(--shadow-float)]">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
        Masuk sebagai
      </p>
      <p className="mt-3 text-[26px] font-extrabold leading-tight text-ink">
        {name}
      </p>

      <p
        className={`mt-4 inline-block rounded-full px-4 py-2 text-sm font-extrabold ${
          isStudent ? "bg-blue/10 text-blue" : "bg-cream text-muted"
        }`}
      >
        {isStudent ? "Penghuni terverifikasi" : "Belum terverifikasi kampus"}
      </p>

      <p className="mt-6 text-[15px] leading-relaxed text-ink-soft">
        Buka salah satu kos, lalu tulis penilaianmu untuk enam fasilitasnya.
      </p>

      <Link
        href="#browse"
        className="mt-7 block rounded-full bg-rose py-4 text-center text-[17px] font-extrabold text-white transition-transform hover:-translate-y-0.5"
      >
        Pilih kos untuk direview
      </Link>
    </div>
  );
}
