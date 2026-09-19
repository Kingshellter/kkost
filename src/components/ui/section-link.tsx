"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

/**
 * A link to a section of the landing page, e.g. `/#login`.
 *
 * From another route it is a plain `Link`, and the page opens at the section
 * without animating. On `/` it scrolls there itself, smoothly: `Link` ignores
 * a click whose hash already matches the URL (so a second "Masuk" did
 * nothing), and smooth scrolling belongs to a click — not to CSS, where it
 * also animated every page load that carried a hash.
 */
export function SectionLink({
  href,
  onClick,
  ...rest
}: ComponentProps<typeof Link> & { href: `/#${string}` }) {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      onClick={(event) => {
        onClick?.(event);
        const target =
          pathname === "/" && document.getElementById(href.slice(2));
        if (!target) return;
        event.preventDefault();
        const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
        target.scrollIntoView({ behavior: still ? "auto" : "smooth" });
        history.replaceState(history.state, "", href);
      }}
      {...rest}
    />
  );
}
