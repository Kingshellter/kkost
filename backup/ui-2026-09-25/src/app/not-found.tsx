import Link from "next/link";
import { Navbar } from "@/components/sections/navbar";

/** Rendered by `notFound()` — e.g. a `/kos/[id]` that does not exist. Next's default is in English. */
export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-24 sm:px-6">
        <div className="w-full max-w-[520px] rounded-[var(--radius-panel)] bg-white p-8 text-center shadow-[var(--shadow-float)] sm:p-10">
          <p className="text-sm font-extrabold tabular-nums text-rose">404</p>
          <h1 className="mt-3 text-[clamp(1.75rem,5vw,2.25rem)] font-extrabold leading-tight tracking-[-0.02em] text-ink">
            Kos ini tidak ditemukan
          </h1>
          <p className="mx-auto mt-3 max-w-[40ch] text-[15px] font-medium text-muted">
            Tautannya mungkin salah ketik, atau kosnya belum pernah tersimpan
            ke database.
          </p>
          <Link
            href="/#browse"
            className="mt-8 inline-block rounded-full bg-ink px-8 py-3.5 text-[15px] font-extrabold text-white transition-transform hover:-translate-y-0.5"
          >
            Lihat semua kos
          </Link>
        </div>
      </main>
    </>
  );
}
