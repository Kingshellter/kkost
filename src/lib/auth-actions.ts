"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { isCampusEmail } from "@/lib/auth";
import { AUTH_INITIAL, type AuthState } from "@/lib/action-state";

const credentials = z.object({
  email: z.email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

const signUpSchema = credentials.extend({
  displayName: z.string().trim().min(2, "Nama minimal 2 karakter"),
});

/** Supabase phrases these in English; the UI is Indonesian. */
function explain(message: string) {
  if (/invalid login credentials/i.test(message)) {
    return "Email atau password salah.";
  }
  if (/already registered|already been registered/i.test(message)) {
    return "Email ini sudah terdaftar. Coba masuk.";
  }
  if (/email not confirmed/i.test(message)) {
    return "Email belum dikonfirmasi. Cek kotak masuk kamu.";
  }
  return message;
}

export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = credentials.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, notice: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: explain(error.message), notice: null };

  revalidatePath("/", "layout");
  return AUTH_INITIAL;
}

export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    displayName: formData.get("displayName"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, notice: null };
  }

  const { email, password, displayName } = parsed.data;
  const supabase = await createClient();

  // `display_name` lands in raw_user_meta_data, which the on_auth_user_created
  // trigger copies into public.profiles (see 0002_reviews.sql).
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });
  if (error) return { error: explain(error.message), notice: null };

  // With email confirmation on, Supabase returns a user but no session.
  if (!data.session) {
    return {
      error: null,
      notice: `Cek email ${email} untuk mengkonfirmasi akun, lalu masuk.`,
    };
  }

  revalidatePath("/", "layout");
  return {
    error: null,
    notice: isCampusEmail(email)
      ? "Akun dibuat. Email kampus terdeteksi — review kamu akan bertanda penghuni terverifikasi."
      : "Akun dibuat.",
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}
