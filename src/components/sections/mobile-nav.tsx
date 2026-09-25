"use client";

import { useEffect, useRef, useState } from "react";
import { buttonClass } from "@/components/ui/controls";
import { SectionLink } from "@/components/ui/section-link";
import { NAV_LINKS } from "@/data/kos";

/**
 * The navbar's link list is hidden below `lg`. Without this the site has no
 * navigation at all on a phone, which the competition rules call out
 * explicitly ("responsive di berbagai perangkat").
 */
export function MobileNav({
  signedIn,
}: {
  /** `null` when unknown (the error page): no "Masuk" either way. */
  signedIn: boolean | null;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Escape closes, a tap anywhere outside the menu closes, and the menu never
  // survives a jump to a new anchor. Pointerdown rather than click, so the
  // menu is already gone when the tap lands on whatever was under it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        className="flex size-11 flex-col items-center justify-center gap-[5px] rounded-full bg-cream transition-[background-color,scale] duration-(--duration-fast) ease-out hover:bg-cream-deep active:scale-(--press-scale) active:duration-(--duration-press)"
      >
        <span className="sr-only">{open ? "Tutup menu" : "Buka menu"}</span>
        <span
          aria-hidden
          className={`h-[2px] w-4 rounded-full bg-ink transition-transform duration-(--duration-base) ease-out ${
            open ? "translate-y-[7px] rotate-45" : ""
          }`}
        />
        <span
          aria-hidden
          className={`h-[2px] w-4 rounded-full bg-ink transition-opacity duration-(--duration-base) ease-out ${
            open ? "opacity-0" : ""
          }`}
        />
        <span
          aria-hidden
          className={`h-[2px] w-4 rounded-full bg-ink transition-transform duration-(--duration-base) ease-out ${
            open ? "-translate-y-[7px] -rotate-45" : ""
          }`}
        />
      </button>

      {/* Always rendered, so it can leave as well as arrive: it grows out
          of the hamburger's corner (origin top right) on --duration-base
          and shrinks back on the shorter --duration-fast. `invisible` takes
          the closed panel out of the Tab order and the accessibility tree;
          visibility flips at the end of the closing transition, at the
          start of the opening one. Reduced motion: fade only. */}
      <div
        id="mobile-nav"
        data-open={open || undefined}
        className="invisible pointer-events-none absolute left-4 right-4 top-[calc(100%+8px)] origin-top-right scale-(--enter-scale) rounded-panel bg-white p-4 opacity-0 shadow-float transition-[opacity,scale,visibility] duration-(--duration-fast) ease-out data-open:visible data-open:pointer-events-auto data-open:scale-100 data-open:opacity-100 data-open:duration-(--duration-base) sm:left-6 sm:right-6"
      >
        <ul className="space-y-1">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <SectionLink
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-full px-4 py-3 text-base font-bold text-ink transition-colors duration-(--duration-fast) hover:bg-cream active:bg-cream-deep"
              >
                {link.label}
              </SectionLink>
            </li>
          ))}
          {signedIn === false && (
            <li>
              <SectionLink
                href="/#login"
                onClick={() => setOpen(false)}
                className={buttonClass("dark", "md", "mt-1 w-full")}
              >
                Masuk
              </SectionLink>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
