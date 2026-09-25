/**
 * Class strings for the site's buttons and form fields, built only from
 * design tokens (see globals.css). Buttons render as <button>, <Link> and
 * <SectionLink> alike, so a class string travels further than a component
 * would. Every value is a complete literal — Tailwind scans for those.
 *
 * Hover, press, focus and loading polish belong here too, so one change
 * reaches every control.
 */

export type ButtonVariant = "primary" | "dark" | "soft";
export type ButtonSize = "sm" | "md" | "lg";

/*
 * - Only the properties that change are transitioned — never `all`.
 * - Press: scales to --press-scale and drops any hover lift, on the shorter
 *   --duration-press so the button answers the finger at once; the release
 *   eases back on --duration-fast. Under reduced motion --press-scale is 1.
 * - Hover lives inside `@media (hover: hover)` (Tailwind v4), so a tap on a
 *   phone never leaves a button lifted.
 * - Focus comes from the global :focus-visible ring in globals.css.
 * - Disabled: dimmed and inert. Loading is disabled too (no double submit)
 *   but marked `aria-busy`, which keeps it at full strength with a
 *   <Spinner /> — it is working, not unavailable.
 */
const BUTTON_BASE =
  "inline-flex select-none items-center justify-center gap-2 rounded-full text-center font-extrabold transition-[translate,scale,background-color,color,opacity] duration-(--duration-fast) ease-out active:translate-y-0 active:scale-(--press-scale) active:duration-(--duration-press) disabled:pointer-events-none disabled:opacity-60 aria-busy:disabled:opacity-100";

const BUTTON_VARIANT: Record<ButtonVariant, string> = {
  /* The one call to action on a surface. `action`, not `rose`: white on
     brand rose is 3.6:1. */
  primary: "bg-action text-white hover:-translate-y-0.5",
  dark: "bg-ink text-white hover:-translate-y-0.5 hover:bg-ink-soft",
  soft: "bg-cream text-ink hover:bg-cream-deep",
};

/* Heights 44 / 48 / 56px — sm is still a full touch target. */
const BUTTON_SIZE: Record<ButtonSize, string> = {
  sm: "px-5 py-2.5 text-base",
  md: "px-7 py-3 text-base",
  lg: "px-8 py-3.5 text-lg",
};

/**
 * `buttonClass("dark", "sm", "w-full")` — extra classes go last.
 *
 * Extras that *add* (layout, margin, width) just work. Extras that *change*
 * something the size or variant already sets — padding, text size, colour —
 * are not guaranteed to win: Tailwind orders its CSS by its own rules, not by
 * the order of the class string, so `px-4` loses to the size's `px-7`. Mark
 * such an override important: `buttonClass("primary", "md", "px-4!")`.
 */
export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  extra = "",
) {
  return `${BUTTON_BASE} ${BUTTON_VARIANT[variant]} ${BUTTON_SIZE[size]} ${extra}`.trim();
}

/*
 * Fields. 16px text on purpose: iOS Safari zooms the page when an input
 * under 16px takes focus. The border is `field` (≥ 3:1 on white and cream);
 * `cream-deep` was 1.1:1 and the field's edge all but disappeared.
 *
 * States: hover darkens the border a step; focus is the global ring plus a
 * white ground, so the field being typed into stands out from its
 * neighbours; `aria-invalid` turns the border to `danger`; disabled is
 * dimmed and says so with the cursor.
 */
const FIELD_STATES =
  "border border-field bg-cream text-base text-ink transition-[border-color,background-color] duration-(--duration-fast) placeholder:font-medium placeholder:text-muted hover:border-muted focus:bg-white aria-invalid:border-danger disabled:cursor-not-allowed disabled:opacity-60";

export const INPUT_CLASS = `mt-2 w-full rounded-full px-5 py-3.5 font-bold ${FIELD_STATES}`;

export const SELECT_CLASS = `${INPUT_CLASS} cursor-pointer`;

export const TEXTAREA_CLASS = `mt-2 w-full resize-y rounded-media px-5 py-4 font-medium ${FIELD_STATES}`;

/** The label above a field. */
export const LABEL_CLASS = "text-sm font-extrabold text-ink";

/** One-line message under a field. */
export const FIELD_ERROR_CLASS = "mt-1.5 block text-sm font-bold text-danger";

/** A boxed message after a form: error, info, or warning. */
export const NOTICE_CLASS = {
  error: "rounded-box bg-danger/10 px-4 py-3 text-sm font-bold text-danger",
  info: "rounded-box bg-blue/10 px-4 py-3 text-sm font-bold text-blue",
  warning: "rounded-box bg-amber/15 px-4 py-3 text-sm font-medium text-ink",
} as const;
