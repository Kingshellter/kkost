import { AuthCard } from "@/components/auth/auth-card";
import { BoundaryCircle, SEAMS } from "@/components/ui/boundary-circle";
import { buttonClass } from "@/components/ui/controls";
import { MaskLine } from "@/components/ui/mask-line";
import { Reveal } from "@/components/ui/reveal";
import { REVEAL_GROW, REVEAL_RISE, step } from "@/components/ui/reveal-classes";
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
      <Reveal className="pointer-events-none absolute -right-52 bottom-10 size-[420px]">
        <div
          aria-hidden
          style={step(2)}
          className={`size-full rounded-full bg-amber-soft ${REVEAL_GROW}`}
        />
      </Reveal>

      <Reveal className="relative mx-auto grid w-full max-w-page items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-16">
        <div>
          {/* Two sentences, one line each: the break is the full stop. */}
          <h2 className="font-extrabold text-ink text-title">
            <MaskLine beat={0}>Pernah ngekos?</MaskLine>
            <MaskLine beat={1}>Ceritakan.</MaskLine>
          </h2>

          <p
            style={step(3)}
            className={`mt-5 max-w-[44ch] text-lg leading-relaxed text-ink ${REVEAL_RISE}`}
          >
            Lima menit darimu bisa menyelamatkan mahasiswa berikutnya dari
            setahun yang buruk. Satu review per kos, per orang.
          </p>
        </div>

        <div style={step(4)} className={REVEAL_RISE}>
          {user ? (
            <SignedInCard name={user.displayName} isStudent={user.isStudent} />
          ) : (
            <AuthCard />
          )}
        </div>
      </Reveal>
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
