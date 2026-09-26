import { createClient } from "@/utils/supabase/server";
import { isSupabaseConfigured } from "@/lib/kos-repository";

export type SessionUser = {
  id: string;
  email: string;
  displayName: string;
  /**
   * Signed up with a .ac.id address — earns the "mahasiswa terverifikasi"
   * badge. It proves a campus inbox, not that the person ever lived in the kos.
   */
  isStudent: boolean;
};

/**
 * Reads the current user from cookies. Returns null when nobody is signed in
 * *or* when Supabase is not configured, so callers only handle one empty case.
 *
 * Read this in Server Components. Never trust a user id sent from the client.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, is_student")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email,
    displayName:
      profile?.display_name ?? user.email.split("@")[0],
    isStudent: profile?.is_student ?? isCampusEmail(user.email),
  };
}

/**
 * Password reset. The emailed link lands on /auth/confirm, which signs the
 * user in and sets this httpOnly cookie; /auth/reset-password and its
 * `updatePassword` action refuse to change a password without it. It is what
 * stops any signed-in session from changing the password without knowing
 * the old one: only a session that came from the reset link may.
 */
export const RECOVERY_COOKIE = "kkost-recovery";
export const RECOVERY_PATH = "/auth/reset-password";
/** 15 minutes to choose a new password after clicking the link. */
export const RECOVERY_MAX_AGE = 15 * 60;

/** Indonesian academic institutions all sit under .ac.id. */
export function isCampusEmail(email: string) {
  return email.trim().toLowerCase().endsWith(".ac.id");
}
