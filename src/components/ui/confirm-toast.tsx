"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { durationMs } from "@/lib/motion";

/** How long a success message stays before it leaves on its own. */
const AUTO_HIDE_MS = 5000;

/**
 * The one-off message after an email link or a password change
 * (`?konfirmasi=` on `/`). A toast floating under the navbar, not a block in
 * the page, so leaving shifts nothing.
 *
 * - The query parameter is removed from the URL on arrival, so a refresh (or
 *   a shared link) does not show the message again.
 * - `autoHide` messages (success) leave after 5s; the rest (a failure, or an
 *   instruction such as "sign in now") stay until closed with ×.
 * - Enters dropping `--enter-y` with a fade on `--duration-base`, leaves the
 *   same way on `--duration-fast`, then unmounts on a timer (not
 *   `transitionend`, see `lib/motion.ts`).
 */
export function ConfirmToast({
  message,
  tone,
  autoHide,
}: {
  message: string;
  tone: "info" | "error";
  autoHide: boolean;
}) {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has("konfirmasi")) {
      url.searchParams.delete("konfirmasi");
      history.replaceState(history.state, "", url);
    }
  }, []);

  useEffect(() => {
    if (!autoHide) return;
    const timer = setTimeout(() => setLeaving(true), AUTO_HIDE_MS);
    return () => clearTimeout(timer);
  }, [autoHide]);

  useEffect(() => {
    if (!leaving) return;
    const timer = setTimeout(() => setGone(true), durationMs("--duration-fast"));
    return () => clearTimeout(timer);
  }, [leaving]);

  if (gone) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-24 z-(--z-nav) flex justify-center px-gutter lg:top-6">
      <div
        role={tone === "error" ? "alert" : "status"}
        data-hidden={leaving || undefined}
        className={`pointer-events-auto flex w-full max-w-[480px] items-start gap-2 rounded-media py-2 pl-5 pr-2 text-sm font-bold text-white shadow-float transition-[opacity,translate] duration-(--duration-base) ease-out starting:-translate-y-(--enter-y) starting:opacity-0 data-hidden:-translate-y-(--enter-y) data-hidden:opacity-0 data-hidden:duration-(--duration-fast) ${
          tone === "error" ? "bg-danger" : "bg-ink"
        }`}
      >
        <p className="flex-1 py-2.5 leading-snug">{message}</p>
        <button
          type="button"
          onClick={() => setLeaving(true)}
          aria-label="Tutup pesan"
          className="grid size-11 shrink-0 place-items-center rounded-full text-white/80 transition-[color,background-color,scale] duration-(--duration-fast) ease-out hover:bg-white/10 hover:text-white active:scale-(--press-scale) active:duration-(--duration-press)"
        >
          <X aria-hidden className="size-5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
