"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { INPUT_CLASS, LABEL_CLASS } from "@/components/ui/controls";

/**
 * A password input with a show/hide button. Used by `AuthCard` and the
 * new-password form on /auth/reset-password.
 *
 * Not a `<Field>`: the show/hide button must sit outside the label, or its
 * name would join the input's ("Password Lihat password").
 */
export function PasswordField({
  id,
  label = "Password",
  name = "password",
  autoComplete,
  hint,
}: {
  id: string;
  label?: string;
  name?: string;
  autoComplete: "current-password" | "new-password";
  /** Shown under the label and tied to the input with aria-describedby. */
  hint?: string;
}) {
  const [shown, setShown] = useState(false);
  const hintId = `${id}-hint`;

  return (
    <div>
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
      </label>
      {hint && (
        <p id={hintId} className="mt-1 text-sm font-medium text-muted">
          {hint}
        </p>
      )}
      <div className="relative">
        <input
          id={id}
          type={shown ? "text" : "password"}
          name={name}
          required
          minLength={8}
          aria-describedby={hint ? hintId : undefined}
          autoComplete={autoComplete}
          className={`${INPUT_CLASS} pr-14!`}
        />
        {/* Centred on the input, which starts 0.5rem down (INPUT_CLASS mt-2). */}
        <button
          type="button"
          onClick={() => setShown((v) => !v)}
          aria-pressed={shown}
          aria-label={`Lihat ${label.toLowerCase()}`}
          className="absolute right-1 top-[calc(50%+0.25rem)] grid size-11 -translate-y-1/2 place-items-center rounded-full text-muted transition-colors duration-(--duration-fast) hover:text-ink active:bg-cream"
        >
          {shown ? (
            <EyeOff aria-hidden className="size-5" strokeWidth={2} />
          ) : (
            <Eye aria-hidden className="size-5" strokeWidth={2} />
          )}
        </button>
      </div>
    </div>
  );
}
