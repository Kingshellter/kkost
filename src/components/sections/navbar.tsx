import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { NAV_LINKS } from "@/data/kos";

export function Navbar() {
  return (
    <header className="relative z-30 px-4 pt-5 sm:px-6 lg:px-10">
      <nav
        aria-label="Utama"
        className="mx-auto flex max-w-[1240px] items-center gap-6 rounded-full bg-white px-5 py-3 shadow-[var(--shadow-lift)] sm:px-6"
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

        <div className="ml-auto flex items-center gap-4 lg:ml-0">
          <button
            type="button"
            className="text-sm font-bold text-muted transition-colors hover:text-ink"
          >
            ID
          </button>
          <Link
            href="#login"
            className="rounded-full bg-ink px-6 py-2.5 text-[15px] font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            Log in
          </Link>
        </div>
      </nav>
    </header>
  );
}
