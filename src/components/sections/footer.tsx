import { Logo } from "@/components/ui/logo";
import { SectionLink } from "@/components/ui/section-link";
import { NAV_LINKS } from "@/data/kos";

/**
 * Closes the page instead of letting it stop dead at the amber section, and
 * carries the map data credit that OpenStreetMap's licence asks for beyond
 * the attribution inside the map itself.
 */
export function Footer() {
  return (
    <footer className="px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-page flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Logo />
          <p className="mt-3 text-sm font-medium text-muted">
            Gratis mencari, gratis menilai. Seluruh Indonesia.
          </p>
        </div>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <SectionLink
                  href={link.href}
                  className="text-sm font-bold text-ink transition-colors duration-(--duration-fast) hover:text-action"
                >
                  {link.label}
                </SectionLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <p className="mx-auto mt-8 max-w-page border-t border-cream-deep pt-6 text-xs font-medium text-muted">
        Data peta ©{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 transition-colors duration-(--duration-fast) hover:text-ink"
        >
          kontributor OpenStreetMap
        </a>
      </p>
    </footer>
  );
}
