"use client";

import { ArrowLeft } from "lucide-react";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import {
  buttonClass,
  INPUT_CLASS,
  NOTICE_CLASS,
} from "@/components/ui/controls";
import { Field } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { AUTH_INITIAL, type AuthState } from "@/lib/action-state";
import { requestPasswordReset, signIn, signUp } from "@/lib/auth-actions";
import { PasswordField } from "./password-field";

type Mode = "signin" | "signup";

const MODES = ["signin", "signup"] as const;
const TAB_LABEL: Record<Mode, string> = { signin: "Masuk", signup: "Daftar" };

/**
 * Sign in and sign up in one card, switched by a tab list. Used by the CTA
 * section and in place of the review form on a kos page.
 *
 * The tabs follow the ARIA tabs pattern: one tab in the Tab order at a time,
 * arrow keys / Home / End move between them, and the form is the tabpanel.
 *
 * "Lupa password?" under the sign-in password swaps the tabs for a one-field
 * reset form (`ResetRequestForm`) in the same card, keeping the email typed
 * so far; "Kembali ke Masuk" swaps back.
 */
export function AuthCard() {
  const [mode, setMode] = useState<Mode>("signin");
  const [resetting, setResetting] = useState(false);
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

  if (resetting) {
    return (
      <div className="rounded-panel bg-white p-6 shadow-float sm:p-8">
        <ResetRequestForm
          email={email}
          onEmail={setEmail}
          onBack={() => {
            setMode("signin");
            setResetting(false);
            // The tabs are back on the next render; focus "Masuk" there.
            requestAnimationFrame(() => tabs.current.signin?.focus());
          }}
        />
      </div>
    );
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
            gap. The tabs' text colour runs on the pill's own curve and
            duration, so the label turns white as the pill arrives under it —
            on ease-out it went white while the pill was a quarter of the way
            there, white on cream for a beat. Reduced motion: pill and colour
            both switch at once. */}
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
            className={`relative min-h-11 flex-1 select-none rounded-full text-sm font-extrabold transition-[color,scale] duration-(--duration-base) [transition-timing-function:var(--ease-in-out),var(--ease-out)] motion-reduce:transition-none active:scale-(--press-scale) active:duration-(--duration-press) ${
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
        onForgot={() => setResetting(true)}
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
  onForgot,
}: {
  mode: Mode;
  id: string;
  labelledBy: string;
  email: string;
  onEmail: (value: string) => void;
  displayName: string;
  onDisplayName: (value: string) => void;
  onForgot: () => void;
}) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    mode === "signin" ? signIn : signUp,
    AUTH_INITIAL,
  );

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

        <div>
          <PasswordField
            id={`${id}-password`}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            hint={mode === "signup" ? "Minimal 8 karakter." : undefined}
          />
          {mode === "signin" && (
            <div className="mt-1 flex justify-end">
              <button
                type="button"
                onClick={onForgot}
                className="min-h-11 text-sm font-bold text-action transition-colors duration-(--duration-fast) hover:text-ink active:text-ink"
              >
                Lupa password?
              </button>
            </div>
          )}
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

/**
 * "Lupa password?": one email field that asks Supabase for a reset link.
 * The heading takes focus when the view opens, so a screen reader hears
 * where it landed. Whatever the address, the answer reads the same (see
 * `requestPasswordReset`).
 */
function ResetRequestForm({
  email,
  onEmail,
  onBack,
}: {
  email: string;
  onEmail: (value: string) => void;
  onBack: () => void;
}) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    requestPasswordReset,
    AUTH_INITIAL,
  );
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);

  return (
    <form
      action={formAction}
      className="transition-[opacity,translate] duration-(--duration-base) ease-out starting:translate-y-(--enter-y) starting:opacity-0"
    >
      <button
        type="button"
        onClick={onBack}
        className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-sm font-bold text-muted transition-colors duration-(--duration-fast) hover:text-ink active:text-ink"
      >
        <ArrowLeft aria-hidden className="size-4" strokeWidth={2.5} />
        Kembali ke Masuk
      </button>

      <h3
        ref={heading}
        tabIndex={-1}
        className="mt-3 text-2xl font-extrabold leading-tight text-ink focus-visible:outline-none"
      >
        Reset password
      </h3>
      <p className="mt-2 text-base leading-relaxed text-muted">
        Masukkan email akun kkost kamu. Kami kirim link untuk mengatur password
        baru.
      </p>

      <div className="mt-6">
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
        {pending ? "Mengirim…" : "Kirim link reset"}
      </button>
    </form>
  );
}
