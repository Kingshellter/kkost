import { Logo } from "@/components/ui/logo";

export function Cta() {
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
          <p className="eyebrow bg-ink text-amber">Log in to post</p>

          <h2 className="mt-7 text-[clamp(2.25rem,5.5vw,3.75rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-ink">
            Lived somewhere?
            <br />
            Write it down.
          </h2>

          <p className="mt-7 max-w-[44ch] text-lg leading-relaxed text-ink">
            Five minutes of your time saves the next student a bad year. One
            review per kos, per tenancy — editable for 30 days.
          </p>

          <div className="mt-14 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Logo />
            <p className="text-[15px] font-bold text-ink">
              · Free to search, free to review. Yogyakarta, Indonesia.
            </p>
          </div>
        </div>

        <SignInCard />
      </div>
    </section>
  );
}

function SignInCard() {
  return (
    <form className="rounded-[var(--radius-panel)] bg-white p-8 shadow-[var(--shadow-float)]">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
        Step 1 of 3 · Sign in
      </p>

      <div className="mt-7 space-y-5">
        <label className="block">
          <span className="text-[15px] font-extrabold text-ink">
            Campus email
          </span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="rina.a@mail.ugm.ac.id"
            className="mt-2.5 w-full rounded-full border border-cream-deep bg-cream px-6 py-4 text-[15px] font-bold text-ink outline-none transition-colors placeholder:text-ink/70 focus:border-rose"
          />
        </label>

        <label className="block">
          <span className="text-[15px] font-extrabold text-ink">Password</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••••••"
            className="mt-2.5 w-full rounded-full border border-cream-deep bg-cream px-6 py-4 text-[15px] font-bold text-ink outline-none transition-colors focus:border-rose"
          />
        </label>
      </div>

      <button
        type="submit"
        className="mt-7 w-full rounded-full bg-rose py-4 text-[17px] font-extrabold text-white transition-transform hover:-translate-y-0.5"
      >
        Log in and continue
      </button>

      <p className="mx-auto mt-5 max-w-[38ch] text-center text-sm font-medium text-muted">
        A campus email marks your review as a verified tenant.
      </p>
    </form>
  );
}
