import { FIELD_ERROR_CLASS, LABEL_CLASS } from "@/components/ui/controls";

/**
 * A label wrapped around one control, so clicking the label focuses it and
 * the label text is the control's accessible name.
 *
 * - `hint` sits in the label, muted: "(opsional)".
 * - `description` is help that must stay readable while typing — a
 *   placeholder disappears on the first keystroke, this does not.
 * - `error` is the one-line message under the control; pair it with
 *   `aria-invalid` on the control itself.
 */
export function Field({
  label,
  hint,
  description,
  error,
  children,
}: {
  label: string;
  hint?: string;
  description?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={LABEL_CLASS}>
        {label}
        {hint && <span className="font-medium text-muted"> ({hint})</span>}
      </span>
      {description && (
        <span className="mt-1 block text-sm font-medium text-muted">
          {description}
        </span>
      )}
      {children}
      {error && <span className={FIELD_ERROR_CLASS}>{error}</span>}
    </label>
  );
}
