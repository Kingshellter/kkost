import Link from "next/link";
import { buttonClass } from "@/components/ui/controls";
import { SectionLink } from "@/components/ui/section-link";
import { Logo } from "@/components/ui/logo";
import { NAV_LINKS } from "@/data/kos";
import { getSessionUser } from "@/lib/auth";
import { signOut } from "@/lib/auth-actions";
import { MobileNav } from "./mobile-nav";

export async function Navbar() {
  const user = await getSessionUser();

  // Sticky below lg only: on a phone the page runs 7,000px+ and the menu is
  // the way around it. From lg up every section is one screen and the page
  // is short enough to scroll back; a pinned bar there would also cover the
  // top of each one-screen section.
  return (
    <header className="sticky top-0 z-(--z-nav) px-4 pt-5 sm:px-6 lg:relative lg:px-10">
      <nav
        aria-label="Utama"
        className="relative mx-auto flex max-w-page items-center gap-6 rounded-full bg-white px-5 py-3 shadow-lift sm:px-6"
      >
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        <ul className="hidden flex-1 items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <SectionLink
                href={link.href}
                className="text-base font-bold text-ink transition-colors hover:text-action"
              >
                {link.label}
              </SectionLink>
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
                  title="Mahasiswa — email kampus (.ac.id) terkonfirmasi"
                  className="hidden rounded-full bg-blue/10 px-3 py-1.5 text-xs font-extrabold text-blue sm:block"
                >
                  Mahasiswa
                </span>
              )}
              <form action={signOut}>
                <button type="submit" className={buttonClass("soft", "sm")}>
                  Keluar
                </button>
              </form>
            </>
          ) : (
            <SectionLink
              href="/#login"
              className={buttonClass("dark", "sm", "max-sm:hidden")}
            >
              Masuk
            </SectionLink>
          )}

          <MobileNav signedIn={Boolean(user)} />
        </div>
      </nav>
    </header>
  );
}
