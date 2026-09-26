"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { expectArrival, replayOnArrival } from "./reveal";

/**
 * A link to a section of the landing page, e.g. `/#login`.
 *
 * From another route it is a plain `Link`, and the page opens at the section
 * without animating. On `/` it scrolls there itself, smoothly: `Link` ignores
 * a click whose hash already matches the URL (so a second "Masuk" did
 * nothing), and smooth scrolling belongs to a click — not to CSS, where it
 * also animated every page load that carried a hash.
 *
 * Either way the target section plays its entrance when the visitor gets
 * there, not while the page is still scrolling past it (`replayOnArrival`).
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
        // A new-tab click (or one a parent already handled) is the browser's.
        const modified =
          event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
        if (event.defaultPrevented || modified || event.button !== 0) return;
        const id = href.slice(2);
        const target = pathname === "/" && document.getElementById(id);
        if (!target) {
          expectArrival(id);
          return;
        }
        event.preventDefault();
        replayOnArrival(target);
        const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
        target.scrollIntoView({ behavior: still ? "auto" : "smooth" });
        history.replaceState(history.state, "", href);
      }}
      {...rest}
    />
  );
}
