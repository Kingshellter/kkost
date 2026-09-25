"use client";

import { useEffect, useState } from "react";
import { SectionLink } from "@/components/ui/section-link";
import { NAV_LINKS } from "@/data/kos";

/**
 * The navbar's link list is hidden below `lg`. Without this the site has no
 * navigation at all on a phone, which the competition rules call out
 * explicitly ("responsive di berbagai perangkat").
 */
export function MobileNav({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);

  // Escape closes, and the menu never survives a jump to a new anchor.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-full bg-cream"
      >
        <span className="sr-only">{open ? "Tutup menu" : "Buka menu"}</span>
        <span
          aria-hidden
          className={`h-[2px] w-4 rounded-full bg-ink transition-transform ${
            open ? "translate-y-[7px] rotate-45" : ""
          }`}
        />
        <span
          aria-hidden
          className={`h-[2px] w-4 rounded-full bg-ink transition-opacity ${
            open ? "opacity-0" : ""
          }`}
        />
        <span
          aria-hidden
          className={`h-[2px] w-4 rounded-full bg-ink transition-transform ${
            open ? "-translate-y-[7px] -rotate-45" : ""
          }`}
        />
      </button>

      {open && (
        <div
          id="mobile-nav"
          className="absolute left-4 right-4 top-[calc(100%+8px)] rounded-[var(--radius-panel)] bg-white p-4 shadow-[var(--shadow-float)] sm:left-6 sm:right-6"
        >
          <ul className="space-y-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <SectionLink
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-full px-4 py-3 text-[15px] font-bold text-ink hover:bg-cream"
                >
                  {link.label}
                </SectionLink>
              </li>
            ))}
            {!signedIn && (
              <li>
                <SectionLink
                  href="/#login"
                  onClick={() => setOpen(false)}
                  className="mt-1 block rounded-full bg-ink px-4 py-3 text-center text-[15px] font-bold text-white"
                >
                  Masuk
                </SectionLink>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
