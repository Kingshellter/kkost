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
- Radii/shadows are consumed as arbitrary values:
  `rounded-[var(--radius-panel)]`, `shadow-[var(--shadow-lift)]`.

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
  selected, so `required` blocks the resubmit. The pattern used in `AuthCard`
  and `ReviewForm`: keep the field uncontrolled, mirror it into `useState` via
  `onChange`, and pass that state as `defaultValue` / `defaultChecked` — the
  reset then restores the user's input. Never keep a password this way.

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
  `storage.objects` (`owner_id`). 0009 is the reference.
- **A new embed must not take the page down before its migration runs.**
  Retry the plain query when the embedded select errors, as `fetchKosList`
  does for `kos_photos` and `fetchReviews` does for `is_demo`.
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

The `#trust` section and the `ScoreProvenance` panel state, in public, what the
database enforces. Treat them as part of the schema's contract:

- Never add a claim there that a constraint, policy, or trigger does not back.
- If you weaken a policy in `supabase/migrations/`, remove the matching claim in
  the same change — `TRUST_GUARANTEES` in `src/data/kos.ts` and the table in the
  root `README.md`.
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
optional `campus`. Show a distance only when that kos has a `campus`.

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
