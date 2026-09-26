import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import {
  RECOVERY_COOKIE,
  RECOVERY_MAX_AGE,
  RECOVERY_PATH,
} from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

/** What the landing page's ConfirmNotice says after the redirect. */
export type ConfirmOutcome =
  | "berhasil"
  | "masuk"
  | "gagal"
  | "reset-gagal"
  | "password-diubah";

/**
 * Where the links in kkost's emails land: the sign-up confirmation and the
 * password reset.
 *
 * Supabase can send either shape of link, depending on the email template:
 *
 * - `?code=` — the default template. For a sign-up, Supabase has already
 *   confirmed the address before redirecting here; exchanging the code only
 *   signs the user in. The exchange needs the PKCE verifier cookie set when
 *   the email was requested, so it fails when the link is opened in another
 *   browser or on a phone — the account is confirmed anyway, so that outcome
 *   asks the user to sign in rather than reporting an error.
 * - `?token_hash=&type=` — a template pointing at this route directly. Works on
 *   any device, because verifying the hash is what confirms the address (or,
 *   with `type=recovery`, signs the user in for a reset).
 *
 * A password reset is recognised by `type=recovery` or by `next` pointing at
 * the reset page (the `code` shape carries no type). On success it sets the
 * recovery cookie and goes to /auth/reset-password; a failure there is
 * `reset-gagal`, never `masuk`: without a session no password can change.
 *
 * An expired or reused link comes back with `?error=` instead.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const origin = request.nextUrl.origin;
  const type = params.get("type") as EmailOtpType | null;
  const recovery = type === "recovery" || safeNext(params.get("next")) === RECOVERY_PATH;

  const to = (outcome: ConfirmOutcome) =>
    NextResponse.redirect(new URL(`/?konfirmasi=${outcome}#login`, origin));
  const toReset = () => {
    const response = NextResponse.redirect(new URL(RECOVERY_PATH, origin));
    response.cookies.set(RECOVERY_COOKIE, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: RECOVERY_MAX_AGE,
      path: RECOVERY_PATH,
    });
    return response;
  };

  if (params.has("error")) return to(recovery ? "reset-gagal" : "gagal");

  const supabase = await createClient();

  const tokenHash = params.get("token_hash");
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (recovery) return error ? to("reset-gagal") : toReset();
    return to(error ? "gagal" : "berhasil");
  }

  const code = params.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (recovery) return error ? to("reset-gagal") : toReset();
    return to(error ? "masuk" : "berhasil");
  }

  return to(recovery ? "reset-gagal" : "gagal");
}

/**
 * `next` as a same-site path, or null. Only "/…" is accepted, never "//…" or
 * "/\…", which browsers read as another host: a link may not use this route
 * to send someone off the site.
 */
function safeNext(next: string | null) {
  if (!next || !next.startsWith("/") || /^\/[/\\]/.test(next)) return null;
  return next;
}
