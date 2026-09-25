"use client"; // Error boundaries must be Client Components

import Link from "next/link";
import { buttonClass } from "@/components/ui/controls";
import { Logo } from "@/components/ui/logo";

/**
 * Shown when a page throws — most often `fetchKos` failing because the
 * database cannot be reached. It never falls back to demo data (see
 * kos-repository.ts), so this page has to say plainly what happened.
 */
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-24 sm:px-6">
      <div className="w-full max-w-[520px] rounded-panel bg-white p-8 text-center shadow-float sm:p-10">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h1 className="mt-7 text-[clamp(1.75rem,5vw,2.25rem)] font-extrabold leading-tight tracking-[-0.02em] text-ink">
          Halaman ini gagal dimuat
        </h1>
        <p className="mx-auto mt-3 max-w-[40ch] text-[15px] font-medium text-muted">
          Biasanya karena database sedang tidak bisa dihubungi. kkost tidak
          menggantinya dengan data karangan — coba lagi sebentar lagi.
        </p>
        {error.digest && (
          <p className="mt-3 text-xs font-medium text-muted">
            Kode kesalahan: <code>{error.digest}</code>
          </p>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => retry()}
            className={buttonClass("primary", "md", "flex-1")}
          >
            Coba lagi
          </button>
          <Link
            href="/"
            className={buttonClass("soft", "md", "flex-1")}
          >
            Ke beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
