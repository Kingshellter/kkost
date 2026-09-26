"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { isCampusEmail, RECOVERY_COOKIE, RECOVERY_PATH } from "@/lib/auth";
import { AUTH_INITIAL, type AuthState } from "@/lib/action-state";

const credentials = z.object({
  email: z.email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

const signUpSchema = credentials.extend({
  displayName: z.string().trim().min(2, "Nama minimal 2 karakter"),
});

const newPasswordSchema = z
  .object({
    password: credentials.shape.password,
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Kedua password tidak sama",
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
  if (/different from the old password/i.test(message)) {
    return "Password baru harus berbeda dari yang lama.";
  }
  if (/only request this after|rate limit/i.test(message)) {
    return "Terlalu sering. Tunggu sebentar sebelum meminta link lagi.";
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
  // The confirmation link must come back to whichever host the user signed up
  // on — localhost or the live site. Supabase ignores it unless the URL is in
  // Authentication → URL Configuration → Redirect URLs, and falls back to the
  // Site URL.
  const origin = (await headers()).get("origin");

  // `display_name` lands in raw_user_meta_data, which the on_auth_user_created
  // trigger copies into public.profiles (see 0002_reviews.sql).
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      emailRedirectTo: origin ? `${origin}/auth/confirm` : undefined,
    },
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
      ? "Akun dibuat. Email kampus terdeteksi, jadi review kamu akan bertanda mahasiswa terverifikasi."
      : "Akun dibuat.",
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}

/**
 * "Lupa password?": emails a reset link. The answer is the same whether or
 * not the address has an account, so the form cannot be used to find out
 * who is registered. Only a rate limit is reported, since that is about the
 * visitor, not the address.
 */
export async function requestPasswordReset(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = credentials.shape.email.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, notice: null };
  }

  const supabase = await createClient();
  // Same rule as signUp: the link comes back to the host it was asked from,
  // if that host is in the project's Redirect URLs. `next` marks the link as
  // a reset for /auth/confirm (the default template's `?code=` has no type).
  const origin = (await headers()).get("origin");
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: origin
      ? `${origin}/auth/confirm?next=${RECOVERY_PATH}`
      : undefined,
  });
  if (error && /only request this after|rate limit/i.test(error.message)) {
    return { error: explain(error.message), notice: null };
  }

  return {
    error: null,
    notice: `Kalau ${parsed.data} terdaftar di kkost, link untuk mengatur password baru sudah dikirim ke sana. Cek juga folder spam.`,
  };
}

/**
 * /auth/reset-password: sets the new password. Needs both the session the
 * reset link created and the recovery cookie /auth/confirm set with it; an
 * ordinary signed-in session cannot change the password here.
 */
export async function updatePassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = newPasswordSchema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, notice: null };
  }

  const cookieStore = await cookies();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!cookieStore.has(RECOVERY_COOKIE) || !user) {
    return {
      error: "Link reset sudah kedaluwarsa. Minta link baru dari halaman masuk.",
      notice: null,
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return { error: explain(error.message), notice: null };

  cookieStore.set(RECOVERY_COOKIE, "", { path: RECOVERY_PATH, maxAge: 0 });
  revalidatePath("/", "layout");
  redirect("/?konfirmasi=password-diubah#login");
}
