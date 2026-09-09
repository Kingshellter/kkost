import { createClient } from "@/utils/supabase/server";
import { isSupabaseConfigured } from "@/lib/kos-repository";

export type SessionUser = {
  id: string;
  email: string;
  displayName: string;
  /** Signed up with a .ac.id address — earns the "verified tenant" badge. */
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

/** Indonesian academic institutions all sit under .ac.id. */
export function isCampusEmail(email: string) {
  return email.trim().toLowerCase().endsWith(".ac.id");
}
