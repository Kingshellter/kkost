import Link from "next/link";
import { SectionLink } from "@/components/ui/section-link";
import { Logo } from "@/components/ui/logo";
import { NAV_LINKS } from "@/data/kos";
import { MobileNav } from "./mobile-nav";

/**
 * The navbar without the account: logo, section links, the phone menu, and a
 * slot on the right. Synchronous and free of server-only imports, so it also
 * renders inside `error.tsx` — an error boundary is a Client Component and
 * cannot import the async `Navbar`, which reads the session from cookies.
 *
 * `signedIn` is `null` where the session cannot be read: the phone menu then
 * offers no "Masuk", rather than offering it to someone already signed in.
 */
export function NavbarFrame({
  account,
  signedIn,
}: {
  account: React.ReactNode;
  signedIn: boolean | null;
}) {
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
          {account}
          <MobileNav signedIn={signedIn} />
        </div>
      </nav>
    </header>
  );
}
