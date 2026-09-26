"use client";

import { useActionState, useId } from "react";
import { buttonClass, NOTICE_CLASS } from "@/components/ui/controls";
import { Spinner } from "@/components/ui/spinner";
import { AUTH_INITIAL, type AuthState } from "@/lib/action-state";
import { updatePassword } from "@/lib/auth-actions";
import { PasswordField } from "./password-field";

/**
 * The form on /auth/reset-password: the new password twice. On success
 * `updatePassword` redirects to the landing page, signed in, so there is no
 * success state here, only errors. The inputs are not kept across a failed
 * submit (React 19 resets the form): passwords are never held in state.
 */
export function NewPasswordForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    updatePassword,
    AUTH_INITIAL,
  );
  const id = useId();

  return (
    <form action={formAction} className="mt-7 text-left">
      <div className="space-y-5">
        <PasswordField
          id={`${id}-password`}
          label="Password baru"
          autoComplete="new-password"
          hint="Minimal 8 karakter."
        />
        <PasswordField
          id={`${id}-confirm`}
          label="Ulangi password baru"
          name="confirm"
          autoComplete="new-password"
        />
      </div>

      {state.error && (
        <p role="alert" className={`mt-5 ${NOTICE_CLASS.error}`}>
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className={buttonClass("primary", "lg", "mt-7 w-full")}
      >
        {pending && <Spinner />}
        {pending ? "Menyimpan…" : "Simpan password baru"}
      </button>
    </form>
  );
}
