"use client";

import { useActionState, useState } from "react";
import { AUTH_INITIAL, type AuthState } from "@/lib/action-state";
import { signIn, signUp } from "@/lib/auth-actions";

type Mode = "signin" | "signup";

/**
 * Replaces the deck's mock sign-in card. Two modes share one card so the CTA
 * section keeps its single-column layout.
 */
export function AuthCard() {
  const [mode, setMode] = useState<Mode>("signin");
  const action = mode === "signin" ? signIn : signUp;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    AUTH_INITIAL,
  );

  return (
    <form
      action={formAction}
      className="rounded-[var(--radius-panel)] bg-white p-8 shadow-[var(--shadow-float)]"
    >
      <div
        role="tablist"
        aria-label="Masuk atau daftar"
        className="flex gap-1 rounded-full bg-cream p-1"
      >
        {(["signin", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={`flex-1 rounded-full py-2.5 text-sm font-extrabold transition-colors ${
              mode === m ? "bg-ink text-white" : "text-muted hover:text-ink"
            }`}
          >
            {m === "signin" ? "Masuk" : "Daftar"}
          </button>
        ))}
      </div>

      <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
        {mode === "signin" ? "Masuk untuk menulis" : "Buat akun"}
      </p>

      <div className="mt-5 space-y-5">
        {mode === "signup" && (
          <Field label="Nama tampilan">
            <input
              name="displayName"
              required
              minLength={2}
              autoComplete="name"
              placeholder="Rina A."
              className={inputClass}
            />
          </Field>
        )}

        <Field label="Email kampus">
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="rina.a@mail.ugm.ac.id"
            className={inputClass}
          />
        </Field>

        <Field label="Password">
          <input
            type="password"
            name="password"
            required
            minLength={8}
            autoComplete={
              mode === "signin" ? "current-password" : "new-password"
            }
            placeholder="Minimal 8 karakter"
            className={inputClass}
          />
        </Field>
      </div>

      {state.error && (
        <p
          role="alert"
          className="mt-5 rounded-2xl bg-rose/10 px-4 py-3 text-sm font-bold text-rose"
        >
          {state.error}
        </p>
      )}

      {state.notice && (
        <p
          role="status"
          className="mt-5 rounded-2xl bg-blue/10 px-4 py-3 text-sm font-bold text-blue"
        >
          {state.notice}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-7 w-full rounded-full bg-rose py-4 text-[17px] font-extrabold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {pending
          ? "Memproses…"
          : mode === "signin"
            ? "Masuk dan lanjutkan"
            : "Daftar"}
      </button>

      <p className="mx-auto mt-5 max-w-[38ch] text-center text-sm font-medium text-muted">
        Email kampus (.ac.id) menandai review kamu sebagai penghuni
        terverifikasi.
      </p>
    </form>
  );
}

const inputClass =
  "mt-2.5 w-full rounded-full border border-cream-deep bg-cream px-6 py-4 text-[15px] font-bold text-ink outline-none transition-colors placeholder:text-muted focus:border-rose";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[15px] font-extrabold text-ink">{label}</span>
      {children}
    </label>
  );
}
