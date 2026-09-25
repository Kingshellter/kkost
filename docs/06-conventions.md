# 06 · Conventions

Rules derived from the existing code. Follow them so new work is indistinguishable
from what is already there.

## Next.js 16

This is **not** the Next.js in most training data. Before using an unfamiliar
API, read the relevant guide in `node_modules/next/dist/docs/`. Two live
examples of the difference already in this repo:

- `layout.tsx` types its props as `LayoutProps<"/">`, pages as
  `PageProps<"/kos/[id]">` — generated global types, no import needed. After
  adding a route, run `npx next typegen` or `tsc` will not know about it.
- `cookies()` is **async** (`const cookieStore = await cookies()`).
- `params` is a **Promise**: `const { id } = await props.params`.
- The `middleware.ts` convention is **deprecated**. This repo uses `src/proxy.ts`
  exporting a function named `proxy`.

Server Components are the default. Add `"use client"` only when you need
browser APIs, hooks, or event handlers — and push the boundary as far down the
tree as possible (see `MapFrame`).

## Tailwind v4

- Tokens go in the `@theme inline` block in `globals.css`, **not** a config file.
- Reusable CSS goes in an `@utility` block (see `eyebrow`).
- **Never build class names by string interpolation of a variable**
  (`bg-${accent}`). Tailwind scans for complete literals. Use the lookup maps in
  `components/ui/accent.ts`, or an inline `style` with `ACCENT_HEX`.
- **Use tokens, never raw values** (full list in `04-design-system.md`):
  - colour: semantic names first — `bg-action`, `text-danger`, `ring-focus`,
    `border-field`; palette names (`text-ink`, `bg-cream`) for everything else.
    Never `bg-rose`/`text-rose` for a button, link or error: `rose` is brand
    decoration and fails AA with text — use `action` / `danger`.
  - type: `text-display` / `text-title` / `text-heading` for headings,
    Tailwind's `text-xs…2xl` below that. **No `text-[Npx]`.** Body copy,
    inputs, selects and buttons are at least `text-base` (16px) — iOS zooms
    on a focused input under 16px.
  - layout: `py-section lg:py-section-lg`, `max-w-page` / `max-w-narrow`.
  - radius: `rounded-full` for controls, `rounded-panel` / `rounded-media` /
    `rounded-box` for surfaces. No `rounded-[22px]`.
  - shadow: `shadow-lift`, `shadow-float`, `shadow-control`, `shadow-pin`.
  - motion: `duration-(--duration-*)` with `ease-out` (entering, press) or
    `ease-in-out` (moving on screen) — both are the strong curves; never a
    bare `duration-150` or `ease-in`. Pressables get
    `active:scale-(--press-scale)`; entrances start from `--enter-scale` /
    `--enter-y`, never `scale(0)`. Movement written with these tokens turns
    itself off under reduced motion; hard-coded movement must be gated with
    `motion-safe:` instead. Exits run one duration step shorter than entrances.
  - focus: comes free from the global `:focus-visible` rule — add nothing.
    Never `outline-none` without a replacement; where the real control is
    hidden or borderless, put `focus-ring-within` on its wrapper and
    `focus-visible:outline-none` on the control.
  - states every pressable needs: hover (Tailwind's is touch-safe),
    `active:scale-(--press-scale)` (`--press-scale-surface` for a whole card)
    with `active:duration-(--duration-press)`, and a transition listing only
    the properties that change — never bare `transition` / `all`.
  - loading: keep the button `disabled` (no double submit), add
    `aria-busy={pending}` and a `<Spinner />` as its first child, and change
    the label to say what is happening ("Menyimpan…").
  - invalid fields: `aria-invalid={Boolean(errors.x)}` — `INPUT_CLASS` turns
    the border `danger` from that.
  - z-index: `z-(--z-nav)`, `z-(--z-map-overlay)`, `z-(--z-dialog)`; no new
    literal z values.
- **Buttons and form fields take their classes from `components/ui/controls.ts`**
  — `buttonClass("primary" | "dark" | "soft", "sm" | "md" | "lg", extra)`,
  `INPUT_CLASS`, `SELECT_CLASS`, `TEXTAREA_CLASS`, `LABEL_CLASS`,
  `FIELD_ERROR_CLASS`, `NOTICE_CLASS`. Never hand-write a button's pill,
  colour and padding again; extra layout (`w-full`, `mt-7`, `flex-1`) goes in
  the third argument. One `primary` per surface.
  **An extra that changes what the size or variant already sets (padding,
  text size, colour) must be marked important** — `px-4!`, `text-sm!`,
  `text-white!`. Tailwind orders its CSS by its own rules, not by the order
  of the class string, so a plain `px-4` silently loses to the size's `px-7`
  (found in Fase 4b: the detail page's two half-width buttons wrapped to two
  lines). An override that changes nothing is dead code — leave it out.
  Labels must fit on one line at every width; shorten the label before
  shrinking the text.
- Leaflet `divIcon` HTML uses Tailwind classes too, not inline colours.
- **A modal renders through `createPortal(…, document.body)`.** Anything with
  a running `.reveal` animation (or a transform) is a stacking context, and a
  dialog inside one cannot rise above the sticky navbar however high its
  z-index. `AddKosDialog` in `kos-map.tsx` is the reference.
- **Disclosure without JavaScript**: a `peer sr-only` checkbox, a `<label
  htmlFor>` styled as the button, and the panel as a later sibling with
  `hidden peer-checked:grid` (plus `lg:grid` if it is always open on a
  laptop). Give the label `peer-focus-visible:outline-*` for keyboard users,
  and `defaultChecked` when the panel holds something already applied. The
  browse filter is the reference.
- **Touch-only UI checks `matchMedia("(pointer: coarse)")`; hover-only UI
  checks `(hover: hover)`** — through a live subscription
  (`useSyncExternalStore` on the query's `change` event, `useMediaQuery` in
  `kos-map.tsx`), **never read once into state**: a 2-in-1 laptop or an iPad
  with a trackpad changes its primary pointer while the page is open, and a
  snapshot left the map locked on a desktop. Keep the user's own toggle as
  separate state and derive the result (`locked = coarse && !unlocked`), so
  no effect has to sync the two. The map's lock pill and its hover tooltips
  are the reference.
- **Leaflet motion follows reduced motion too**: any `flyTo` / `flyToBounds`
  needs an `animate: false` path when `prefers-reduced-motion: reduce`
  matches.
- **Anchored sections get `scroll-mt-24 lg:scroll-mt-0`** — the navbar is
  sticky below `lg`, and without the margin a `SectionLink` lands under it.
- A new colour is added to `@theme` in `globals.css`, **its contrast checked**
  against the grounds it will sit on, and the table in `04-design-system.md`
  updated — then `ACCENT_HEX` too if it is an accent.

## TypeScript

- `strict: true`. No `any`.
- Import with the `@/` alias, never relative paths that climb out of a folder
  (`@/lib/format`, not `../../lib/format`). Siblings use `./`.
- Prefer `type` aliases over `interface` — that is what the codebase uses.
- Model outcomes as **discriminated unions**, not thrown errors, for anything
  the UI has to branch on. `SaveResult` is the reference example.
- `import type { ... }` for type-only imports.

## Component style

- Named exports for components (`export function KosCard`). The one default
  export is `KosMap`, because `dynamic()` needs it.
- Props typed inline for 1–2 props; a local `type Props = {...}` beyond that.
- Small local helpers (`Field`, `HeroCard`, `ScoreInput`, `ClickCatcher`) live
  at the bottom of the file that uses them. Do not promote them to `ui/` until a
  second file needs them.
- Formatting always goes through `lib/format.ts`. Do not inline
  `toLocaleString` in a component.
- When the same rule appears at a third call site, give it a component. The
  `reviews === 0 → "Baru"` rule silently drifted apart across four files before
  `KosScoreBadge` existed.

## Comments

The codebase comments **why**, not what — often with a specific reason a naive
reader would get wrong. Examples worth matching in tone:

> "Tailwind scans for complete class strings, so every accent variant is spelled out here rather than composed at runtime."

> "Leaflet touches `window` at import time, so the map can only load in the browser."

> "Overflow on the root element always applies to the viewport; the padding compensates for the vanishing scrollbar so the layout underneath does not jump sideways."

Use JSDoc `/** ... */` for exported functions and types. Skip comments that
restate the code.

## Accessibility

Already present, keep it up: `aria-label` on the map's nav, `role="img"` +
label on `FacilityBar`, `role="dialog"` + `aria-modal` + `aria-labelledby` on
the modal, Escape-to-close, backdrop-click-to-close, `autoFocus` on the first
field, `sr-only` labels on unlabelled inputs, `aria-hidden` on every decorative
blob, `autoComplete` on the auth inputs.

The review form's 1–5 scales are a real `<fieldset>` of radio inputs with an
`sr-only` control behind each pill — keyboard- and screen-reader-navigable, and
it would still submit without JavaScript.

Modals trap Tab inside themselves and hand focus back on close.
`AddKosDialog` is the reference: its trigger lives in a map popup that is gone
by the time it closes, so focus returns to the map container instead
(`returnFocusRef`).

## Graceful degradation

A checkout with no Supabase credentials **must still run**. Three places
implement this and any new Supabase code must too:

1. `src/proxy.ts` returns early without the env vars.
2. `isSupabaseConfigured` gates `saveKos`, which returns `"unconfigured"`.
3. `AddKosDialog` shows an amber warning; `KosMap` still adds the pin and words
   the toast differently.
4. `fetchKosList` returns `KOS_LIST` **only** when unconfigured (`source: "demo"`).
   A database error is `source: "unavailable"` with an empty list, and
   `fetchKos` throws. **Never fall back to demo data when Supabase is
   configured** — the demo kos carry invented scores, and showing them during
   an outage presents fake numbers as reviews.
5. Every limit on user-entered data lives in a database CHECK first; a zod
   schema in the form may mirror it for an earlier error, never replace it.

## Responsive

The competition rules require the site to work at every screen size, and the
navbar is the easy thing to get wrong: its link list is `hidden lg:flex`, so
`MobileNav` must keep working. Check any new navigation at 375px before calling
it done.

## Error UX

Errors are surfaced **in Indonesian, inline, and actionable** — they name the
file to run or the policy to add. The dialog stays open on error so the user's
input is not lost. No `alert()`, no `console.error` as the user-facing path.

## Server Actions

- Actions live in `src/lib/*-actions.ts` with `"use server"` at the top.
- **A `"use server"` module may only export async functions.** State objects for
  `useActionState` therefore live in `src/lib/action-state.ts`. Exporting a
  plain object or a const from an actions file fails the production build with
  `A "use server" file can only export async functions, found object` — and
  `next dev` will not catch it.
- **Never trust the client for identity.** The form sends *which* kos and the
  user's own input; the author is re-read from the session inside the action
  (`getSessionUser()`).
- Validate every action input with zod. `FormData` is untrusted.
- Call `revalidatePath` for every route whose output changed — a review changes
  both `/kos/[id]` and `/`.
- **React 19 resets a `<form action>` after the action settles** — on error
  too. A plain uncontrolled field loses what the user typed, and a controlled
  radio (`checked=`) comes back unchecked in the DOM while its UI still looks
  selected, so the resubmit sends nothing. The pattern used in `AuthCard`
  and `ReviewForm`: keep the field uncontrolled, mirror it into `useState` via
  `onChange`, and pass that state as `defaultValue` / `defaultChecked` — the
  reset then restores the user's input. Never keep a password this way.
- **Files never go through a Server Action** (1 MB body limit). Give the
  file input no `name`, keep the files in component state, and upload them
  from the browser straight to Storage after the action returns the id they
  belong to — `ReviewForm`'s `submitWithPhotos` is the reference. The action's
  result stands even if an upload fails; report that part separately.
- **Forms validate themselves, not through the browser.** Put `noValidate` on
  the `<form>` and check in code (zod, or a small check in `onSubmit`), so
  every message is Indonesian, in our `FIELD_ERROR_CLASS` / `NOTICE_CLASS`
  style, and points at the field that is wrong. Browser bubbles speak the
  browser's language, and a `required` radio group points at one radio out of
  thirty. Avoid native constraints that fight the schema: `type="number"` with
  `step` rejected any price that was not a multiple of it. Money is a text
  field with `inputMode="numeric"` that keeps only the digits. `AddKosDialog`
  and `ReviewForm` are the references.
- **A component whose state must survive a Server Action's revalidation must
  not change branch because of it.** `revalidatePath` re-renders the page
  with fresh data; if that data flips a conditional in the parent (as
  "already reviewed" does), the old child unmounts mid-submit and its result
  state is lost. Pass the flag down and let the component decide, as
  `<ReviewForm alreadyReviewed>` does.
- **Tabs are the full ARIA pattern or not tabs at all:** `role="tab"` with
  `id` + `aria-controls`, the content in `role="tabpanel"` +
  `aria-labelledby`, only the selected tab at `tabIndex={0}`, and
  ArrowLeft/Right/Home/End moving selection and focus. `AuthCard` is the
  reference. When each tab has its own action state, key the panel by tab.
- **Help text that must stay visible goes in `Field`'s `description`, not the
  placeholder** — a placeholder disappears on the first keystroke.
- **Blob previews** (`URL.createObjectURL`) are made in the event handler that
  picks the file and revoked when it is removed, plus once on unmount — not
  derived in an effect (the lint forbids `setState` in an effect body).

## Supabase

- Read/write through the right factory for the environment (see
  [02-architecture.md](02-architecture.md#supabase-clients--three-of-them-do-not-mix)).
- **Repository functions take the client as their first argument** so the same
  query works server-side and in the browser. Do not import a client factory
  inside a repository.
- Column names live **only** in that table's `*-repository.ts`.
- Derived values (`kos.score`, `kos.reviews`, `reviews.average`) are computed by
  the database. The app never writes them.
- Schema changes go in a new numbered file under `supabase/migrations/`
  (`0002_...sql`), written idempotently (`if not exists`, `drop constraint if
  exists` before `add constraint`) — they are pasted into the SQL Editor by hand
  and may be run twice.
- RLS problems are solved with policies, never by disabling RLS.
- **RLS picks rows, not columns.** Supabase grants `anon` and `authenticated`
  INSERT/UPDATE on every column, so "update your own row" also means "rewrite
  any column of it". For every table, `revoke insert, update ... from anon,
  authenticated`, then `grant insert (...)` / `grant update (...)` only the
  columns a user legitimately types in. 0006 is the reference; the linter does
  not catch this, `information_schema.column_privileges` does.
- A trigger that maintains an aggregate must recompute for **both** `OLD` and
  `NEW` keys on UPDATE — a row can move from one parent to another.
- Wrap `auth.uid()` as `(select auth.uid())` inside policies — otherwise it is
  re-evaluated per row.
- Trigger functions are `SECURITY DEFINER` and live in `public`, so PostgREST
  exposes them as RPC. Revoke `execute` from `public, anon, authenticated`;
  triggers do not check the caller's EXECUTE privilege.
- Index every foreign key column.
- Run `get_advisors` (security **and** performance) after every schema change.
- **Storage buckets follow the table rules.** Limits (size, MIME type) live on
  the bucket; policies grant INSERT only; no UPDATE/DELETE policy for anything
  a user contributes; no SELECT policy on a public bucket (it enables listing).
  A table row that points at an object is checked by a trigger against
  `storage.objects` (`owner_id`). 0010 is the reference.
- **A new embed must not take the page down before its migration runs.**
  Retry the plain query when the embedded select errors, as `fetchReviews`
  does for `review_photos` (0010) and `is_demo` (0007).
- **Writes need an identity, reads never do.** New tables get
  `select using (true)` and writes `to authenticated`. Browsing kkost must stay
  possible without an account; contributing must not.

## Map

- Markers are `L.divIcon` with inline HTML. Do not introduce image marker assets.
- Overlays above the map need explicit z-index (`z-[500]`, dialog `z-[1000]`).
- Coordinates are `[lat, lng]` everywhere.
- Leaflet CSS overrides belong in `globals.css`, not in component styles.
- **Never hardcode a centre, a zoom, or a reference point.** kkost is
  nationwide; `FitToKos` derives the view from the data. `INDONESIA` is only the
  fallback for an empty map.
- Anything measured in pixels against the map container must scale with it —
  the container is 343px wide on a phone and ~800px on a desktop.
- **Map UI that takes typing or clicks goes outside `MapContainer`**, as a
  sibling overlay. Inside it, Leaflet also treats those events as drags, zooms
  and map clicks. `MapSearch` is the reference.
- **Fit around the overlays, not under them.** The search box and hint cover
  the top of the map at every width, so `FitToKos` adds `OVERLAY_INSET` to the
  top padding. Change it if that column's height changes.
- **Anything that moves the view on purpose must switch `FitToKos` off** with a
  latch that never resets (`searchTookOver`), or a later auto-fit will undo it.

## Third-party services

`saveKos` is not the only outside call any more. Whatever you add:

- **Keyless or it does not ship.** Tiles and geocoding both work with no env
  var, which is what keeps a bare checkout usable. A key means a new
  `NEXT_PUBLIC_*`, and that reaches the browser.
- **One module owns the endpoint**, the way a repository owns its table —
  `lib/geocode.ts` is the only file that knows a Nominatim URL.
- **Return a discriminated union, never throw.** `GeocodeResult` follows
  `SaveResult`: the caller renders `"error"` inline, in Indonesian.
- **Respect the provider's rate limit in the UI that triggers it.** Debounce,
  set a minimum query length, and abort the in-flight request with an
  `AbortController` — the effect's cleanup is where that belongs.

## Effects

React's lint (`react-hooks/set-state-in-effect`) rejects a **synchronous**
`setState` in an effect body, so `npm run lint` fails on it. State that a user
action implies belongs in the handler for that action; keep the effect for the
asynchronous part only. `MapSearch` splits exactly along that line —
`type()` resets the panel, the effect owns just the debounced fetch.

## URL state for filters

Anything a visitor would want to share or bookmark — filters, sort order —
lives in `searchParams`, read by the Server Component page and parsed with zod
using `.catch(...)` so a bad URL degrades to the default instead of erroring.
The forms that set it are plain GET forms (`action="/#browse"`), not client
state. `src/lib/kos-browse.ts` is the reference.

## Claims about integrity

The `ScoreProvenance` panel and the root `README.md` state, in public, what the
database enforces. Treat them as part of the schema's contract:

- Never add a claim there that a constraint, policy, or trigger does not back.
- If you weaken a policy in `supabase/migrations/`, remove the matching claim in
  the same change — the `ScoreProvenance` copy and the table in the root
  `README.md`.
- A false claim here is worse than no claim: the competition theme is
  trustworthiness, and a judge can read the migrations.
- **No typed-in statistics, anywhere on the site.** Counts are computed from
  the data (`summarizeKos`). The hero once claimed 11,907 reviews over an empty
  table.
- **No promise of a feature that does not exist.** Owner replies and review
  editing were both advertised before either had a UI.
- **Demo data is labelled at the source.** Seeded reviews come from accounts
  flagged `profiles.is_demo` and render with a "Review contoh" badge. Never
  seed an unlabelled review.

## Language and place

All user-facing copy is Indonesian — marketing and app alike. Numbers go
through `lib/format.ts` (`id-ID`). `<html lang="id">`. Code, comments and these
docs stay in English.

The brand is **kkost**, lowercase, everywhere. Copy must not assume a city or a
campus: kkost covers all of Indonesia, and each kos carries its own `city` and
optional `campus`. Render the campus line with `formatCampus` — "700 m ke X" or
"Dekat X" when the distance is unknown, which is the norm for new kos.

## Git — manual only, agents must not run it

**Agents never run `git commit`, `git push`, or `git pull` in this repo.** Not
at the end of a task, not when asked to "save" or "wrap up", not with
`--no-verify`, not through an alias, script, or subagent. Same for `gh pr
create` / `gh pr merge` and anything else that writes to GitHub. The
maintainers do all of it by hand.

| Allowed | Not allowed |
|---|---|
| `git status`, `git diff`, `git log`, `git show` — read-only, for context | `git add` / `git commit` / `git push` / `git pull` / `git fetch`+merge / `git rebase` |
| Editing files and leaving them in the working tree | `gh pr create`, `gh pr merge`, any GitHub write |
| Writing a suggested commit message *as text* | Running that message through `git commit` |

Finish a task by reporting what changed and leaving it uncommitted. Do not end
with "commit?" — the answer is always no. If a task genuinely cannot proceed
without a commit, stop and hand it back.

Branch names in use: `main`, `ui-h-1`. Existing commit messages are terse
(`1`, `2`, `update readme,...`) — not a standard to copy if you are asked to
draft one.
