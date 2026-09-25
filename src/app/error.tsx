"use client"; // Error boundaries must be Client Components

import Link from "next/link";
import { useEffect } from "react";
import { Footer } from "@/components/sections/footer";
import { NavbarFrame } from "@/components/sections/navbar-frame";
import { buttonClass } from "@/components/ui/controls";
import { StatusCard } from "@/components/ui/status-card";

/**
 * Shown when a page throws — most often `fetchKos` failing because the
 * database cannot be reached. It never falls back to demo data (see
 * kos-repository.ts), so this page has to say plainly what happened.
 *
 * The navbar is `NavbarFrame` without the account slot: the real `Navbar`
 * reads the session on the server, which a Client Component cannot import —
 * and the failure may well be that read.
 */
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <title>Gagal dimuat · kkost</title>
      <NavbarFrame account={null} signedIn={null} />
      <StatusCard
        title="Halaman ini gagal dimuat"
        actions={
          <>
            <button
              type="button"
              onClick={() => retry()}
              className={buttonClass("primary", "md")}
            >
              Coba lagi
            </button>
            <Link href="/" className={buttonClass("soft", "md")}>
              Ke beranda
            </Link>
          </>
        }
      >
        <p>
          Biasanya karena database sedang tidak bisa dihubungi. kkost tidak
          menggantinya dengan data karangan. Coba lagi sebentar lagi.
        </p>
        {error.digest && (
          <p className="mt-3 text-sm">
            Kode kesalahan: <code>{error.digest}</code>
          </p>
        )}
      </StatusCard>
      <Footer />
    </>
  );
}
