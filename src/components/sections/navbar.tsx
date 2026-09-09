import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { NAV_LINKS } from "@/data/kos";
import { getSessionUser } from "@/lib/auth";
import { signOut } from "@/lib/auth-actions";
import { MobileNav } from "./mobile-nav";

export async function Navbar() {
  const user = await getSessionUser();

  return (
    <header className="relative z-30 px-4 pt-5 sm:px-6 lg:px-10">
      <nav
        aria-label="Utama"
        className="relative mx-auto flex max-w-[1240px] items-center gap-6 rounded-full bg-white px-5 py-3 shadow-[var(--shadow-lift)] sm:px-6"
      >
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        <ul className="hidden flex-1 items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-[15px] font-bold text-ink transition-colors hover:text-rose"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-3 lg:ml-0 lg:gap-4">
          {user ? (
            <>
              <span className="hidden max-w-[16ch] truncate text-sm font-bold text-ink sm:block">
                {user.displayName}
              </span>
              {user.isStudent && (
                <span
                  title="Penghuni terverifikasi lewat email kampus"
                  className="hidden rounded-full bg-blue/10 px-3 py-1.5 text-xs font-extrabold text-blue sm:block"
                >
                  Terverifikasi
                </span>
              )}
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-full bg-cream px-5 py-2.5 text-[15px] font-bold text-ink transition-colors hover:bg-cream-deep"
                >
                  Keluar
                </button>
              </form>
            </>
          ) : (
            <Link
              href="#login"
              className="hidden rounded-full bg-ink px-6 py-2.5 text-[15px] font-bold text-white transition-transform hover:-translate-y-0.5 sm:block"
            >
              Masuk
            </Link>
          )}

          <MobileNav signedIn={Boolean(user)} />
        </div>
      </nav>
    </header>
  );
}
