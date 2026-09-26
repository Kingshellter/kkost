"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { glideTo, stopGlide } from "@/lib/scroll";
import { expectArrival, holdForArrival } from "./reveal";

/**
 * A link to a section of the landing page, e.g. `/#login`.
 *
 * From another route it is a plain `Link`, and the page opens at the section
 * without animating. On `/` it scrolls there itself, smoothly: `Link` ignores
 * a click whose hash already matches the URL (so a second "Masuk" did
 * nothing), and smooth scrolling belongs to a click — not to CSS, where it
 * also animated every page load that carried a hash.
 *
 * On `/` the page glides there (`glideTo`: shorter and softer than the
 * browser's smooth scroll); the sections on the way play their entrances
 * as a lead-in, and the target is held until the page is nearly there
 * (`holdForArrival`). From another route the page opens at the section and
 * the target plays once Next has scrolled to it (`expectArrival`).
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
        stopGlide();
        glideTo(target, holdForArrival(target));
        history.replaceState(history.state, "", href);
      }}
      {...rest}
    />
  );
}
