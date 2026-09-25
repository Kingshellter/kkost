"use client";

import { useActionState, useState } from "react";
import {
  buttonClass,
  INPUT_CLASS,
  LABEL_CLASS,
  NOTICE_CLASS,
} from "@/components/ui/controls";
import { Spinner } from "@/components/ui/spinner";
import { AUTH_INITIAL, type AuthState } from "@/lib/action-state";
import { signIn, signUp } from "@/lib/auth-actions";

type Mode = "signin" | "signup";

/**
 * Replaces the deck's mock sign-in card. Two modes share one card so the CTA
 * section keeps its single-column layout.
 */
export function AuthCard() {
  const [mode, setMode] = useState<Mode>("signin");
  // React 19 resets a <form action> once the action settles, which would wipe
  // what the user typed on every wrong password. Tracking the fields and feeding
  // them back as `defaultValue` makes that reset restore them instead. The
  // password is deliberately not kept.
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const action = mode === "signin" ? signIn : signUp;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    AUTH_INITIAL,
  );

  return (
    <form
      action={formAction}
      className="rounded-panel bg-white p-8 shadow-float"
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
            className={`flex-1 select-none rounded-full py-3 text-sm font-extrabold transition-[background-color,color,scale] duration-(--duration-fast) ease-out active:scale-(--press-scale) active:duration-(--duration-press) ${
              mode === m ? "bg-ink text-white" : "text-muted hover:text-ink"
            }`}
          >
            {m === "signin" ? "Masuk" : "Daftar"}
          </button>
        ))}
      </div>


      <div className="mt-6 space-y-5">
        {mode === "signup" && (
          <Field label="Nama tampilan">
            <input
              name="displayName"
              defaultValue={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              minLength={2}
              autoComplete="name"
              placeholder="Rina A."
              className={inputClass}
            />
          </Field>
        )}

        <Field label="Email">
          <input
            type="email"
            name="email"
            defaultValue={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="rina@email.com"
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
          className={`mt-5 ${NOTICE_CLASS.error}`}
        >
          {state.error}
        </p>
      )}

      {state.notice && (
        <p
          role="status"
          className={`mt-5 ${NOTICE_CLASS.info}`}
        >
          {state.notice}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className={buttonClass("primary", "lg", "mt-7 w-full")}
      >
        {pending && <Spinner />}
        {pending
          ? "Memproses…"
          : mode === "signin"
            ? "Masuk dan lanjutkan"
            : "Daftar"}
      </button>

      <p className="mx-auto mt-5 max-w-[38ch] text-center text-sm font-medium text-muted">
        Email apa pun bisa dipakai. Alamat berakhiran .ac.id menandai review
        kamu sebagai mahasiswa terverifikasi.
      </p>
    </form>
  );
}

const inputClass = INPUT_CLASS;

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={LABEL_CLASS}>{label}</span>
      {children}
    </label>
  );
}
