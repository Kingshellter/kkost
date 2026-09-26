import type { Metadata } from "next";
import { cookies } from "next/headers";
import { NewPasswordForm } from "@/components/auth/new-password-form";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";
import { buttonClass } from "@/components/ui/controls";
import { SectionLink } from "@/components/ui/section-link";
import { StatusCard } from "@/components/ui/status-card";
import { getSessionUser, RECOVERY_COOKIE } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Atur password baru · kkost",
  robots: { index: false },
};

/**
 * Where a password-reset link ends up (via /auth/confirm, which signs the
 * user in and sets the recovery cookie). Without both the session and the
 * cookie (opened directly, or more than 15 minutes later) it explains and
 * points back to "Lupa password?" instead of showing the form.
 */
export default async function ResetPasswordPage() {
  const [user, cookieStore] = await Promise.all([getSessionUser(), cookies()]);
  const valid = Boolean(user) && cookieStore.has(RECOVERY_COOKIE);

  return (
    <>
      <Navbar />
      {valid && user ? (
        <main className="flex flex-1 items-center justify-center px-gutter py-16 sm:py-24">
          <div className="w-full max-w-[460px] rounded-panel bg-white p-6 shadow-float sm:p-10">
            <h1 className="font-extrabold text-ink text-heading">
              Atur password baru
            </h1>
            <p className="mt-3 text-base font-medium text-muted">
              Untuk akun <strong className="font-extrabold text-ink">{user.email}</strong>.
              Setelah disimpan, kamu langsung masuk.
            </p>
            <NewPasswordForm />
          </div>
        </main>
      ) : (
        <StatusCard
          title="Link reset tidak valid"
          actions={
            <SectionLink href="/#login" className={buttonClass("primary", "md")}>
              Minta link baru
            </SectionLink>
          }
        >
          <p>
            Link ini sudah kedaluwarsa, sudah dipakai, atau dibuka di luar
            email reset. Pilih &ldquo;Lupa password?&rdquo; di halaman masuk
            untuk meminta link baru.
          </p>
        </StatusCard>
      )}
      <Footer />
    </>
  );
}
