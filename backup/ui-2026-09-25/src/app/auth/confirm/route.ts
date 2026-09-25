import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

/** What the landing page's ConfirmNotice says after the redirect. */
export type ConfirmOutcome = "berhasil" | "masuk" | "gagal";

/**
 * Where the link in the sign-up confirmation email lands.
 *
 * Supabase can send either shape of link, depending on the email template:
 *
 * - `?code=` — the default template. Supabase has already confirmed the address
 *   before redirecting here; exchanging the code only signs the user in. The
 *   exchange needs the PKCE verifier cookie set at sign-up, so it fails when the
 *   link is opened in another browser or on a phone — the account is confirmed
 *   anyway, so that outcome asks the user to sign in rather than reporting an
 *   error.
 * - `?token_hash=&type=` — a template pointing at this route directly. Works on
 *   any device, because verifying the hash is what confirms the address.
 *
 * An expired or reused link comes back with `?error=` instead.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const to = (outcome: ConfirmOutcome) =>
    NextResponse.redirect(
      new URL(`/?konfirmasi=${outcome}#login`, request.nextUrl.origin),
    );

  if (params.has("error")) return to("gagal");

  const supabase = await createClient();

  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    return to(error ? "gagal" : "berhasil");
  }

  const code = params.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return to(error ? "masuk" : "berhasil");
  }

  return to("gagal");
}
