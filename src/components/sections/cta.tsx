import { AuthCard } from "@/components/auth/auth-card";
import { BoundaryCircle, SEAMS } from "@/components/ui/boundary-circle";
import { buttonClass } from "@/components/ui/controls";
import { SectionLink } from "@/components/ui/section-link";
import { getSessionUser } from "@/lib/auth";

export async function Cta() {
  const user = await getSessionUser();

  return (
    <section
      id="login"
      className="relative scroll-mt-24 overflow-hidden bg-amber px-gutter py-section lg:flex lg:min-h-svh lg:scroll-mt-0 lg:flex-col lg:justify-center lg:py-14"
    >
      {/* Decorative ring + blob from the deck */}
      <BoundaryCircle edge="top" circle={SEAMS.browseCta} />
      <div
        aria-hidden
        className="drift pointer-events-none absolute -right-52 bottom-10 h-[420px] w-[420px] rounded-full bg-amber-soft"
      />

      <div className="reveal relative mx-auto grid w-full max-w-page items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-16">
        <div>
          {/* Two sentences, so the break is the full stop, not decoration. */}
          <h2 className="font-extrabold text-ink text-title">
            Pernah ngekos?
            <br />
            Ceritakan.
          </h2>

          <p className="mt-5 max-w-[44ch] text-lg leading-relaxed text-ink">
            Lima menit darimu bisa menyelamatkan mahasiswa berikutnya dari
            setahun yang buruk. Satu review per kos, per orang.
          </p>
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
    <div className="rounded-panel bg-white p-8 shadow-float">
      <p className="text-sm font-medium text-muted">Masuk sebagai</p>
      <p className="mt-1 text-2xl font-extrabold leading-tight text-ink">
        {name}
      </p>

      <p
        className={`mt-4 inline-block rounded-full px-4 py-2 text-sm font-extrabold ${
          isStudent ? "bg-blue/10 text-blue" : "bg-cream text-muted"
        }`}
      >
        {isStudent ? "Mahasiswa" : "Publik"}
      </p>

      <p className="mt-6 text-base leading-relaxed text-ink-soft">
        Buka salah satu kos, lalu tulis penilaianmu untuk enam fasilitasnya.
      </p>

      <SectionLink
        href="/#browse"
        className={buttonClass("primary", "lg", "mt-7 w-full")}
      >
        Pilih kos untuk direview
      </SectionLink>
    </div>
  );
}
