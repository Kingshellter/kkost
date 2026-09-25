"use client";

import { Eye, EyeOff } from "lucide-react";
import { useActionState, useId, useRef, useState } from "react";
import {
  buttonClass,
  INPUT_CLASS,
  LABEL_CLASS,
  NOTICE_CLASS,
} from "@/components/ui/controls";
import { Field } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { AUTH_INITIAL, type AuthState } from "@/lib/action-state";
import { signIn, signUp } from "@/lib/auth-actions";

type Mode = "signin" | "signup";

const MODES = ["signin", "signup"] as const;
const TAB_LABEL: Record<Mode, string> = { signin: "Masuk", signup: "Daftar" };

/**
 * Sign in and sign up in one card, switched by a tab list. Used by the CTA
 * section and in place of the review form on a kos page.
 *
 * The tabs follow the ARIA tabs pattern: one tab in the Tab order at a time,
 * arrow keys / Home / End move between them, and the form is the tabpanel.
 */
export function AuthCard() {
  const [mode, setMode] = useState<Mode>("signin");
  // Held here, above the keyed form, so switching modes keeps what was typed.
  // The password is deliberately not kept.
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const tabs = useRef<Record<Mode, HTMLButtonElement | null>>({
    signin: null,
    signup: null,
  });
  const id = useId();
  const tabId = (m: Mode) => `${id}-tab-${m}`;
  const panelId = `${id}-panel`;

  function onTabKey(e: React.KeyboardEvent) {
    const i = MODES.indexOf(mode);
    const next =
      e.key === "ArrowRight"
        ? MODES[(i + 1) % MODES.length]
        : e.key === "ArrowLeft"
          ? MODES[(i - 1 + MODES.length) % MODES.length]
          : e.key === "Home"
            ? MODES[0]
            : e.key === "End"
              ? MODES[MODES.length - 1]
              : null;
    if (!next) return;
    e.preventDefault();
    setMode(next);
    tabs.current[next]?.focus();
  }

  return (
    <div className="rounded-panel bg-white p-6 shadow-float sm:p-8">
      <div
        role="tablist"
        aria-label="Masuk atau daftar"
        onKeyDown={onTabKey}
        className="relative flex gap-1 rounded-full bg-cream p-1"
      >
        {/* One ink pill slides under the selected tab instead of each tab
            filling in place — it shows which way the switch went. Moving on
            screen, so ease-in-out. Width: half the row less half the 4px
            gap and the 4px padding each side; shift: its own width plus the
            gap. Reduced motion: it jumps, and the text colour still eases. */}
        <span
          aria-hidden
          className={`absolute inset-y-1 left-1 w-[calc(50%-0.375rem)] rounded-full bg-ink transition-transform duration-(--duration-base) ease-in-out motion-reduce:transition-none ${
            mode === "signup" ? "translate-x-[calc(100%+0.25rem)]" : "translate-x-0"
          }`}
        />
        {MODES.map((m) => (
          <button
            key={m}
            ref={(el) => {
              tabs.current[m] = el;
            }}
            id={tabId(m)}
            type="button"
            role="tab"
            aria-selected={mode === m}
            aria-controls={panelId}
            tabIndex={mode === m ? 0 : -1}
            onClick={() => setMode(m)}
            className={`relative min-h-11 flex-1 select-none rounded-full text-sm font-extrabold transition-[color,scale] duration-(--duration-base) ease-out active:scale-(--press-scale) active:duration-(--duration-press) ${
              mode === m ? "text-white" : "text-muted hover:text-ink"
            }`}
          >
            {TAB_LABEL[m]}
          </button>
        ))}
      </div>

      {/* Keyed by mode: each mode gets its own action state, so an error
          from "Masuk" never shows up under "Daftar". */}
      <AuthForm
        key={mode}
        mode={mode}
        id={panelId}
        labelledBy={tabId(mode)}
        email={email}
        onEmail={setEmail}
        displayName={displayName}
        onDisplayName={setDisplayName}
      />
    </div>
  );
}

function AuthForm({
  mode,
  id,
  labelledBy,
  email,
  onEmail,
  displayName,
  onDisplayName,
}: {
  mode: Mode;
  id: string;
  labelledBy: string;
  email: string;
  onEmail: (value: string) => void;
  displayName: string;
  onDisplayName: (value: string) => void;
}) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    mode === "signin" ? signIn : signUp,
    AUTH_INITIAL,
  );
  const [showPassword, setShowPassword] = useState(false);

  // React 19 resets a <form action> once the action settles, which would wipe
  // what the user typed on every wrong password. The fields are uncontrolled
  // with a state-backed `defaultValue`, so that reset restores them instead.
  return (
    <form
      action={formAction}
      id={id}
      role="tabpanel"
      aria-labelledby={labelledBy}
    >
      <div className="mt-6 space-y-5">
        {mode === "signup" && (
          <Field label="Nama tampilan">
            <input
              name="displayName"
              defaultValue={displayName}
              onChange={(e) => onDisplayName(e.target.value)}
              required
              minLength={2}
              autoComplete="name"
              placeholder="Rina A."
              className={INPUT_CLASS}
            />
          </Field>
        )}

        <Field label="Email">
          <input
            type="email"
            name="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            defaultValue={email}
            onChange={(e) => onEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="rina@email.com"
            className={INPUT_CLASS}
          />
        </Field>

        {/* Not a <Field>: the show/hide button must sit outside the label,
            or its name would join the input's ("Password Lihat password"). */}
        <div>
          <label htmlFor={`${id}-password`} className={LABEL_CLASS}>
            Password
          </label>
          {mode === "signup" && (
            <p id={`${id}-password-hint`} className="mt-1 text-sm font-medium text-muted">
              Minimal 8 karakter.
            </p>
          )}
          <div className="relative">
            <input
              id={`${id}-password`}
              type={showPassword ? "text" : "password"}
              name="password"
              required
              minLength={8}
              aria-describedby={
                mode === "signup" ? `${id}-password-hint` : undefined
              }
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              className={`${INPUT_CLASS} pr-14!`}
            />
            {/* Centred on the input, which starts 0.5rem down (INPUT_CLASS mt-2). */}
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-pressed={showPassword}
              aria-label="Lihat password"
              className="absolute right-1 top-[calc(50%+0.25rem)] grid size-11 -translate-y-1/2 place-items-center rounded-full text-muted transition-colors duration-(--duration-fast) hover:text-ink active:bg-cream"
            >
              {showPassword ? (
                <EyeOff aria-hidden className="size-5" strokeWidth={2} />
              ) : (
                <Eye aria-hidden className="size-5" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>
      </div>

      {state.error && (
        <p role="alert" className={`mt-5 ${NOTICE_CLASS.error}`}>
          {state.error}
        </p>
      )}

      {state.notice && (
        <p role="status" className={`mt-5 ${NOTICE_CLASS.info}`}>
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
        {pending ? "Memproses…" : mode === "signin" ? "Masuk" : "Buat akun"}
      </button>

      <p className="mx-auto mt-5 max-w-[38ch] text-center text-sm font-medium text-muted">
        Email apa pun bisa dipakai. Alamat berakhiran .ac.id menandai review
        kamu sebagai mahasiswa terverifikasi.
      </p>
    </form>
  );
}
