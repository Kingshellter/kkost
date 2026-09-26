# 04 · Design system

Everything is sampled from a design deck called **"Review Kos v5 Rounded"**.
The look: cream ground, navy ink, pill-shaped everything, soft lifted shadows,
big extrabold display type, decorative off-canvas circles.

## Tokens — Tailwind v4, CSS-first

There is **no `tailwind.config.js`**. All tokens live in an `@theme inline`
block in [`src/app/globals.css`](../src/app/globals.css), which means every
token is automatically a utility class (and a CSS variable when something
refers to it — see "How the tokens are consumed" below).

The token set was rebuilt in UI-revamp Fase 2a (25 Sep 2026) from the findings
in [ui-audit.md](ui-audit.md). Dark mode was deliberately **skipped** (the brand
is a light cream ground); the semantic colour names exist so it can be added
later by remapping only those.

### Colour — palette

```css
--color-cream:      #f1ece3   /* page background */
--color-cream-deep: #e7e1d6   /* hairlines and dividers (decorative) */
--color-ink:        #1c2a4e   /* primary text, dark sections */
--color-ink-soft:   #24345c   /* body copy */
--color-rose:       #f93a5a   /* BRAND + DECORATION ONLY — fails AA with text */
--color-rose-deep:  #c81e40   /* the rose that passes AA: actions, errors */
--color-amber:      #fcb800   /* CTA section ground, mid score */
--color-amber-soft: #fcd056
--color-blue:       #3b59df   /* info, "Mahasiswa" badge, focus ring */
--color-sky:        #4fc3f7
--color-teal:       #16805a   /* high score — not a brand colour */
--color-muted:      #62677a   /* secondary text (was #7f8493, failed AA) */
--color-lavender:   #d7d7e2   /* hero blob */
--color-field:      #7d8497   /* input / select borders */
--color-map:        #eee9e1   /* Leaflet ground under the tiles */
```

### Colour — semantic (use these in new and refactored components)

```css
--color-action: var(--color-rose-deep)   /* bg-action, text-action */
--color-danger: var(--color-rose-deep)   /* error text and notices */
--color-focus:  var(--color-blue)        /* ring-focus */
```

Palette names stay for decoration, the accent maps and existing code. The two
roses are the rule to remember: **`rose` is the brand colour (logo, hero
headline, illustrations, blobs); `rose-deep` / `action` is everything a user
reads or presses.** Buttons and error text moved to `action` / `danger` in
Fase 3a; `rose` now remains only on the logo, the hero headline span, the
illustrations. (The section eyebrows that used `text-rose` were removed in Fase 4a.)

### Contrast (WCAG 2.x, checked when the tokens were set)

| Pair | Ratio | Needs |
|---|---|---|
| white on `rose-deep` (buttons) | 5.65 | 4.5 ✅ |
| `rose-deep` on white / on cream | 5.65 / 4.80 | 4.5 ✅ |
| `muted` on white / on cream | 5.61 / 4.77 | 4.5 ✅ |
| white on `teal` (score badge) | 4.92 | 4.5 ✅ |
| `ink` on `amber` | 8.05 | 4.5 ✅ |
| `field` border on white / on cream | 3.74 / 3.18 | 3 ✅ (non-text) |
| `blue` focus ring on white / on cream | 5.71 / 4.85 | 3 ✅ |
| white on `rose` | 3.63 | ❌ — why `rose` never carries text |

Changing any colour token means re-checking this table.

### Type

`--font-sans` / `--font-display` → `var(--font-jakarta)` (Plus Jakarta Sans,
400–800).

Tailwind's own `text-xs/sm/base/lg/xl/2xl` (12/14/16/18/20/24) are kept as they
are. Three display sizes are added, each carrying its own leading and tracking:

| Utility | Size | Leading / tracking | For |
|---|---|---|---|
| `text-display` | `clamp(2.5rem, 6.5vw, 4.25rem)` | 1 / −0.035em | hero h1 |
| `text-title` | `clamp(2rem, 4.5vw, 3rem)` | 1.05 / −0.03em | every section h2 |
| `text-heading` | `clamp(1.75rem, 4vw, 2.5rem)` | 1.05 / −0.02em | detail h1, dialogs, 404/error |

**Minimum 16px (`text-base`) for body copy, inputs, selects and buttons** —
iOS Safari zooms the page when an input under 16px is focused. `15px` and `13px`
are retired. Migration map for Fase 3: 15/17 → `base`/`lg`, 13/12/11 →
`sm`/`xs`, 22/26/28 → `2xl`, 32 → `3xl`.

### Spacing and layout

| Token | Utility | Value | For |
|---|---|---|---|
| `--spacing-section` | `py-section` | 4rem | a section's vertical padding on a phone (was `py-24`) |
| `--spacing-section-lg` | `lg:py-section-lg` | 5rem | the same from `lg` |
| `--container-page` | `max-w-page` | 1240px | page width (was `max-w-[1240px]`) |
| `--container-narrow` | `max-w-narrow` | 1160px | a narrower reading width (unused on `/` since Fase 4a) |

The 4px spacing base is Tailwind's default and unchanged.

**Side gutter: `px-gutter`, never `px-4 sm:px-6 lg:px-10`.** A custom
utility in `globals.css`: 1rem, 1.5rem from `sm`, 2.5rem from `lg`, each
`max()`-ed with `env(safe-area-inset-left/right)`. The viewport is
`viewport-fit=cover` (`layout.tsx`), so on a phone in landscape a section's
background runs under the notch while its content stays clear of it. Every
full-width section, the navbar, the footer, the detail page, `StatusCard` and
the dialog overlay use it. `pb-safe` (`max(1rem, env(safe-area-inset-bottom))`)
is the same idea for anything that reaches the bottom edge of the screen —
today only the dialog overlay.

### Radius

Rule: **controls are `rounded-full`; containers are `panel`; a picture inside a
panel is `media`; small boxes (notices, thumbnails, rows) are `box`.**

| Token | Utility | Value | Replaces |
|---|---|---|---|
| `--radius-panel` | `rounded-panel` | 2rem | `rounded-[var(--radius-panel)]`, `rounded-[32px]` |
| `--radius-media` | `rounded-media` | 1.25rem | `rounded-[22px]` |
| `--radius-box` | `rounded-box` | 1rem | `rounded-2xl` |

### Shadow — always tinted with ink, never black

```css
/* surfaces: 1px ring (edge) + contact shadow + soft lift */
--shadow-lift:    0 0 0 1px ink/.05, 0 1px 2px ink/.06, 0 18px 40px -18px ink/.28  /* cards, bars */
--shadow-float:   0 0 0 1px ink/.06, 0 2px 4px ink/.06, 0 30px 70px -28px ink/.42  /* raised panels, dialogs */
/* small things on the map: one layer */
--shadow-control: 0 8px 20px -8px rgb(28 42 78 / .4)      /* Leaflet zoom + tooltip */
--shadow-pin:     0 8px 20px -6px rgb(28 42 78 / .55)     /* map markers (Fase 3) */
```

The 1px ring (added in Fase 2b) is the card's edge: white on cream is only
1.17:1, so a soft shadow alone left every card fuzzy. A ring inside
`box-shadow` draws that edge without the layout a `border` would add. Because
the tokens are consumed as `shadow-[var(--shadow-lift)]`, every existing card,
panel and bar picked it up at once.

### Motion

Reviewed against Emil Kowalski's design-engineering principles in Fase 2b.

| Token | Value | For |
|---|---|---|
| `ease-out` (`--ease-out`) | `cubic-bezier(0.23, 1, 0.32, 1)` | entering, press feedback, anything answering the user |
| `ease-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` | something on screen moving to a new place |
| `ease-drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` | bottom sheets (iOS-like) |
| `--duration-press` | 100ms | `:active` press |
| `--duration-fast` | 150ms | hover, colour changes — also the default for bare `transition-*` |
| `--duration-base` | 200ms | menu, dropdown, toast |
| `--duration-slow` | 300ms | dialog, sheet — the ceiling for UI motion |
| `--press-scale` | 0.97 | `active:scale-(--press-scale)` on anything pressable |
| `--press-scale-surface` | 0.985 | the same for a whole card — 3% of a card moves its edges ~10px |
| `--enter-scale` | 0.96 | popover/dialog start (with opacity 0) — never from `scale(0)` |
| `--enter-y` | 8px | menu/toast start offset |
| `--duration-reveal` | 500ms | landing entrances and seam circles: a reveal on a marketing surface, replayed on each pass, so it may pass the 300ms UI ceiling |
| `--stagger-step` | 60ms | one beat of that entrance; an element waits `--stagger-step × --step` |
| `--reveal-shift` / `--reveal-line` / `--reveal-pop` / `--reveal-swipe` | 16px / 110% / 0.6 / 0 | its start values: rise (or slide), headline line under its mask, icon scale (never 0), highlight scaleX. Under `reduce` they become 0px / 0% / 1 / 1 |
| `--hover-lift` | 2px | how far a button or kos card rises under a mouse (`hover:-translate-y-(--hover-lift)`) |

Rules that come with them:

- **`ease-out` and `ease-in-out` are Tailwind's own names, overridden** with the
  strong curves — the built-in ones are too weak. There is no strong ease-in:
  UI never starts slow.
- **Bare `transition-colors` / `transition-transform` default to
  `--duration-fast` with `ease`** (`--default-transition-*` in `@theme`), which
  is right for hover and colour. Press and entrances set `ease-out` explicitly.
- **An exit is one step shorter than its entrance** (`slow → base`,
  `base → fast`): the system answering should be quicker than the thing
  arriving.
- **Hover is touch-safe.** `hover:` is redefined in `globals.css`
  (`@custom-variant hover`) to apply only under `(hover: hover) and
  (pointer: fine)` — Tailwind's own checks `(hover: hover)` alone, which some
  Android and hybrid devices report, leaving a tapped card lifted. Hover lift
  is 2px everywhere (`hover:-translate-y-(--hover-lift)`, buttons and kos
  cards), 0 under reduced motion.
- **Reduced motion means less motion, not none.** Under
  `prefers-reduced-motion: reduce` the durations are kept (opacity and colour
  still ease, so a change stays followable) and only the movement tokens
  collapse: `--press-scale` and `--enter-scale` → 1, `--enter-y` and
  `--hover-lift` → 0. A
  component built on these tokens is reduced-motion-safe for free.
- **Focus** is an `outline` of `--focus-width` (2px) at `--focus-offset` (2px)
  in `--color-focus`, not a border-colour change — an outline cannot fight a
  `box-shadow` and survives forced-colors mode. It is **one global rule**
  (`:focus-visible` in `@layer base`, `globals.css`), so every link, button
  and field gets it without a class. Where the real control is invisible or
  borderless — the sr-only radio behind a score pill, the bare select inside
  the hero's search pill — the wrapper carries `focus-ring-within` (an
  `@utility`) and the control `focus-visible:outline-none`. Blue passes 3:1 on
  white, cream and amber.

Durations and the movement/focus tokens are plain `:root` properties (Tailwind
has no namespace for them): `duration-(--duration-fast)`,
`scale-(--press-scale)`.

### Z-index

`:root` properties, used as `z-(--z-dialog)`: `--z-map-overlay` 500,
`--z-nav` 1100, `--z-dialog` 1200. Leaflet's panes stack up to 700 and its
controls to 1000, and the map is not its own stacking context, so anything
that must cover a map — the sticky navbar on phones, a dialog — sits above
1000. Map overlays only need to clear tiles and markers.

### How the tokens are consumed

`@theme inline` copies each value straight into its utility, and Tailwind only
emits a `--color-*`/`--radius-*` variable into the CSS when something refers to
it. So `var(--color-teal)` in a hand-written style may not exist at runtime —
use the utility (`bg-teal`), or `ACCENT_HEX` for Leaflet HTML. The `:root`
block (durations, z-index) is always emitted.

Fase 3a moved every component to the utilities (`rounded-panel`,
`shadow-lift`, `max-w-page`, `z-(--z-dialog)`…); arbitrary
`rounded-[var(--radius-panel)]` no longer appears in `src/`. What is left for
Fase 4 is page copy: section body text still uses `text-[15px]` and the
section headings their own `clamp()`s.

`@utility eyebrow` defines the small uppercase pill. Since Fase 4a it is used
**once on the page, in the hero** (the live counts, `bg-white text-action`);
section headings stand on their own. Keep it that way — an eyebrow over every
section reads as a template (the rule: at most one per three sections).

## The accent system

[`src/components/ui/accent.ts`](../src/components/ui/accent.ts) maps the
`Accent` union to concrete values. Three separate maps, because three contexts:

| Map | Returns | For |
|---|---|---|
| `ACCENT_BG` | `"bg-rose"` etc. | Tailwind class on an element |
| `ACCENT_ON` | `"text-white"` / `"text-ink"` / `"text-amber"` | legible text on that ground |
| `ACCENT_HEX` | `"#f93a5a"` etc. | canvas or anything that cannot take a class. Nothing uses it since Fase 3a — kept in sync with the tokens for when something does |

**Why the maps are spelled out:** Tailwind scans source for *complete* class
strings. `bg-${accent}` would be purged. Never compose accent classes at
runtime — add an entry to the map instead.

`Accent` has two kinds of member. **Identity colours** — `rose`, `amber`,
`blue`, `sky`, `ink` — tint criteria (`CRITERIA.accent`) and illustrations
(`photoAccent`). **Score colours** — `teal`, `amber`, `rose-deep` — come only
from `accentForScore(score)`:

| Average | Accent | Meaning |
|---|---|---|
| `≥ SCORE_HIGH` (4.3) | `teal` | good |
| `≥ SCORE_MID` (3.5) | `amber` | middling |
| below | `rose-deep` | poor |

Used by `KosScoreBadge`, the review cards, the map pins and the sidebar. Until
Fase 2a the scale was `≥ 4.6 rose, ≥ 4.3 amber, else blue` — rose marked the
*best* kos while also meaning "button" and "error", and blue (the lowest band)
was also the "Mahasiswa" badge. A kos with no reviews is still the dark "Baru"
chip (`ink`). The map has no legend for these colours yet — that is Fase 4.

Contrast rule that appears in several places: `amber` and `sky` are light
grounds, so they take dark text; the rest take white.

## Shared primitives (`src/components/ui/`)

| Component | Props | Notes |
|---|---|---|
| `ScoreBadge` | `score`, `size` (`sm`/`md`/`lg`), `accent`, `label`, `className` | The generic circular chip. Pass `label` to show text instead of the number. Colour is `ACCENT_BG[accent]` plus ink text on the light grounds (amber, sky) and white on the rest — not `ACCENT_ON`, which would give ink an amber number. |
| `KosScoreBadge` | `kos`, `size`, `className` | **The one to use for a kos.** Applies the `reviews === 0 → dark "Baru"` rule and picks the accent from the score. Wrapping this in a component is not decoration: the rule used to be spelled out at four call sites, two drifted, and unreviewed kos rendered `0.0` on cards and the hero while the sidebar said "Baru". |
| `KosCard` | `kos: Kos` | Card for the browse grid, linking to `/kos/[id]`. Renders `KosPhoto`, name, "area, city", the campus line (`formatCampus`) when the kos has a `campus`, `ScoreBadge`, highlight pills (`empty:hidden`, so a kos from the database — which has none — leaves no hole), price + review count. |
| `KosPhoto` | `kos` (`name`, `photoAccent`), `className`, `showLabel` | **The only place that draws a kos picture** — always a flat SVG scene (bedroom / study / house / kitchen, chosen by `photoAccent`) on the accent colour, built from palette classes (`fill-ink`, `fill-white/90`…). Carries an "Ilustrasi" chip and an `aria-label` saying it is not a real photo — `showLabel={false}` only where there is no room (the 68px hero avatar, which is also hidden below `sm` — on a phone it squeezed the location into four lines). Size and radius come from `className`. Real photos are not kos pictures: they belong to reviews and render in `ReviewPhotos` inside `review-list.tsx` (3-column square grid, `next/image`, each opening full size). Remote images are allowed only from the `review-photos` public path of the configured Supabase project (`images.remotePatterns`, derived from `NEXT_PUBLIC_SUPABASE_URL`). |
| `FacilityBar` | spread `FacilityScore` | One labelled 0–5 bar, used for **averages** (hero card, the detail page's "Rata-rata per fasilitas"). A single review's six whole numbers are a compact dot + label + number grid in `review-list.tsx` instead — six bars made every review card ~100px taller. The label column is 108px, sized for the longest Indonesian criterion ("Kamar & kasur"). Fill is `ACCENT_BG[accent]`, width `score/5 * 100%` (the one inline style); has `role="img"` + Indonesian `aria-label`. |
| `Logo` | `className?` | Rose "K" circle + "kkost" wordmark. |
| `controls.ts` *(not a component)* | — | **Every button and form field gets its classes here.** `buttonClass(variant, size, extra)` — variants `primary` (`bg-action`), `dark` (`bg-ink`), `soft` (`bg-cream`); sizes `sm`/`md`/`lg` = 44/48/56px, all 16px+ text. `INPUT_CLASS`, `SELECT_CLASS`, `TEXTAREA_CLASS` (16px, `border-field`), `LABEL_CLASS`, `FIELD_ERROR_CLASS`, `NOTICE_CLASS.{error,info,warning}`. Class strings rather than a `<Button>` because the same look renders as `<button>`, `<Link>` and `<SectionLink>`. States (Fase 3b): press scales to `--press-scale` and cancels the hover lift on the shorter `--duration-press`; only `translate, scale, background-color, color, opacity` transition; `disabled` dims to 60% and goes inert; a **loading** button is `disabled` + `aria-busy` + a `<Spinner />` first child, and `aria-busy:disabled:opacity-100` keeps it at full strength — it is working, not unavailable. Fields: border darkens on hover (`hover:border-muted`), the ground turns white on focus, `aria-invalid` turns the border `danger`, `disabled` dims with a not-allowed cursor. |
| `field.tsx` | `label, hint?, description?, error?` | A `<label>` wrapped around one control: `LABEL_CLASS` title, muted `(hint)`, a `description` that stays readable while typing (placeholders vanish on the first keystroke), and `FIELD_ERROR_CLASS` under it. Used by `AuthCard` and `AddKosDialog`. Not for a control with a button inside it (the password field): the button's name would join the label's. |
| `status-card.tsx` | `code?, title, children, actions` | The `<main>` of a page with nothing to show: one centred card, optional `code` ("404") in `text-action`, `h1` in `text-heading`, muted body, actions stacked on a phone and side by side from `sm`. No hooks, so both the 404 pages (server) and `error.tsx` (client) use it. |
| `Reveal` | `as?: "div" \| "ul"`, `margin?` (px), `className`, `children` | **Client.** Wraps one block and flips its `data-reveal`: `hidden` once the block is wholly off screen (grown by `margin`), `shown` when it is back in the top 85% of the screen, so the entrance replays on every pass, down or up, and nothing is ever seen vanishing. Children style both states with `group-data-[reveal=…]/reveal:` classes (`reveal-classes.ts`); never nest two `Reveal`s. Renders without the attribute on the server and never hides a block that is on screen at load, so no-JS visitors and hash links always see the content. `BoundaryCircle` passes `margin={200}` because its 1px strip carries a circle reaching 190px either side. |
| `MaskLine` | `beat`, `children` | One headline line in an `overflow-hidden` mask (4px bottom room for descenders, `text-balance`), rising on `REVEAL_LINE` at `step(beat)`. Every section heading on `/` except the hero's h1 is built from these. |
| `reveal-classes.ts` *(not a component)* | — | `REVEAL_RISE` / `_LINE` / `_POP` / `_GROW` / `_BASE` (keyed to the nearest `Reveal`), `LOAD_RISE` / `_POP` / `_GROW` (hero, `starting:`), and `step(n)`. The one place entrance classes are spelled out. |
| `criterion-icon.ts` *(not a component)* | — | `CRITERION_ICON[facilityKey]` → lucide icon. Shared by "Cara kerja" and the review form, so a facility looks the same where it is explained and where it is scored. |
| `Spinner` | — | The mark inside a loading button: a 16px broken ring in `currentColor`, turning every 600ms (faster than Tailwind's 1s — reads as a quicker wait). `motion-safe:` only; under reduced motion it stands still. `aria-hidden` — the label and `aria-busy` carry the meaning. |
| `SectionLink` | `Link` props, `href: "/#…"` | Link to a landing-page section. **Always root the hash at `/`** — the navbar also renders on `/kos/[id]`, where a bare `#login` only changes the URL. On `/` it scrolls to the element itself, because `Link` does nothing when the clicked hash is already in the URL. The one client component here. Also used for the CTA and sidebar "#browse" links and the map popup's "Masuk atau daftar". |

All of them are Server Components — no `"use client"`, no hooks — except `SectionLink`, which needs `usePathname`, and `Reveal`, which needs an effect.

## Decorative circles

`aria-hidden`, `pointer-events-none` blobs and thick rings. Two kinds:

- **Inside one section** (hero amber, map-band ring and blob, CTA amber-soft):
  may run off the screen's left or right edge, **never** the section's top or
  bottom — every coloured section is `overflow-hidden`, so a circle crossing
  the seam gets sliced by a hard line.
- **Across a seam** — `BoundaryCircle` ([`boundary-circle.tsx`](../src/components/ui/boundary-circle.tsx)).
  Rendered twice, `edge="bottom"` in the upper section and `edge="top"` in
  the lower one, with the same `SEAMS` entry, so each section clips its own
  half and the two read as one circle over the seam. This is the only way to
  cross a seam: one element would be sliced, or would sit on top of the next
  section's text. Both sections need `relative overflow-hidden`, and the
  section's content wrapper needs `relative` so it paints over the circle.
  Current seams: hero → `#cara-kerja` (lavender), map band → `#browse` (amber),
  `#browse` → `#login` (ring). All static since Fase 6.

Check 375, 1024 and 1440px after moving any circle.

## Motion

Dial MOTION 3: motion only where it tells the user something. All of it is a
CSS transition built from the tokens (see **Motion** under Tokens) — no
library, no keyframes, no scroll-driven effects. Entrances use Tailwind's
`starting:` variant (`@starting-style`); exits flip a `data-*` attribute and
unmount after `durationMs("--duration-fast")` (`lib/motion.ts`), never on
`transitionend`, which does not fire when nothing transitions. Entering takes
`--duration-base` (or `-slow`), leaving the shorter `--duration-fast`.

| Element | Purpose | Enter | Exit |
|---|---|---|---|
| `AddKosDialog` | bridge the page ↔ modal jump | backdrop fade + panel `scale(--enter-scale)`→1, base, `ease-out`, centred origin. Only the backdrop fades: the panel is its child, and its own opacity would multiply with the backdrop's | reverse on fast; `inert` while leaving, first close wins |
| `MobileNav` panel | show where it came from | `origin-top-right` scale + fade, base | reverse on fast; `invisible` when closed (out of Tab order) |
| Map toast | feedback after a save | rises `--enter-y` + fade, base | sinks + fade on fast, then unmounts; announced through an always-mounted `sr-only` `role="status"` |
| `SavedCard` (review) | a 1,400px form becomes a small card | rises `--enter-y` + fade, slow; the check follows 75ms later from `--enter-scale` (the site's only stagger — a once-per-kos moment) | — |
| **Seam circles** (`BoundaryCircle`) | the move from one section to the next | both halves of the circle on a seam fade in and grow from `--reveal-pop` around their centre (which lies on the seam), when the seam reaches 85% of the screen. Each half hangs from a 1px `Reveal` strip on the seam line, so both fire at the same scroll position | — |
| **Hero** (`LOAD_*`, page load) | opening the page | `@starting-style`, no JavaScript: the amber blob grows, then eyebrow → headline → subline → search → featured card rise one `--stagger-step` apart; the quote bubble grows last, from its top-left | — |
| **Section openings** (`Reveal` + `MaskLine`) | arriving at each section, every pass (down or up) | each heading line rises from under its mask, then the intro and the content blocks rise one beat apart. Map: map + legend, then the lg sidebar; decorative ring and blob grow. Browse: filter, then the first cards (delay capped at 3 beats). CTA: two headline lines, copy, then the sign-in card; the blob grows. Footer: logo, then links. A filter reload lands on `#browse` already on screen, so it never replays | — |
| "Cara kerja" (`Reveal`) | the six criteria: explanation, every pass | three blocks, each when it comes into view (`IntersectionObserver`, 15% above the bottom edge): headline lines rise from an `overflow-hidden` mask, the amber bar under "tidak" grows `scaleX` from the left, the paragraph rises; cards rise one `--stagger-step` apart and their icons grow from `--reveal-pop`; the panel rises, then its six icons slide in from the left. All `--duration-reveal`, `ease-out`, transitions (not keyframes). A block already on screen at load is never hidden; nothing moves under `reduce`, only the fades stay | — |
| `AuthCard` tab pill | which way the switch went | one ink pill slides `translate-x`, base, `--ease-in-out` (on-screen movement); the tabs' text colour runs on the same curve and duration so a label turns white as the pill arrives; `motion-reduce:transition-none` on both | — |

The map honours reduced motion too: `zoomAnimation`, `fadeAnimation`,
`markerZoomAnimation` and `inertia` are off under `reduce` (read at mount —
Leaflet takes them only when the map is created), and a place search jumps
instead of flying. The hamburger's bars and the filter chevron morph on
`--ease-in-out` and switch instantly under `reduce`.

Plus, from Fase 3: press feedback (`active:scale-(--press-scale)`) on every
control, colour/border transitions on fields, the review form's progress bar
(`scaleX`, base).

Rejected at the "should this animate" gate (Fase 6): kos cards appearing
on every filter change (a list read many times a day; the entrance above
never plays on a filter reload, which lands on `#browse` already on screen), page transitions to the detail page, the
filter (a URL reload), the search dropdown (typing wants instant), a pulsing
map skeleton.

The design file also had a looping float on the amber dot and a 6px hover
lift on the criterion cards: both dropped. The float is the decorative motion
Fase 6 removed, and a lift on a card that is not a link promises a click.

**Removed in Fase 6:** `.reveal` (a scroll-linked fade that could leave a
section half transparent, and moved the sign-in form and the map) and
`.drift` / `.drift-page` (decorative circles moving on scroll, no purpose).
The circles no longer move with scrolling; since 26 Sep 2026 they only grow
in once (see seam circles above).

**Smooth scrolling only on a click** — `SectionLink` calls
`scrollIntoView({ behavior: "smooth" })` when it is clicked on `/`.
**Never set `scroll-behavior: smooth` on `html`**: that also animates every
page load that carries a hash, and the browse and hero filters are GET forms
that reload `/?kota=…#browse` — the page visibly slid down from the top on
every "Terapkan". Page loads land on the section instantly.

## Leaflet styling

Leaflet ships its own CSS and paints its own containers, so `globals.css`
overrides it:

- `.leaflet-container` — `var(--color-map)` (`#eee9e1`) background, inherits
  the app font. `map-frame.tsx`'s loading placeholder uses `bg-map` too
- `.leaflet-tile-pane` — `filter: grayscale(.92) brightness(1.06) contrast(.9)`
  to wash OSM tiles down to the deck's muted basemap
- `.leaflet-control-zoom` — pill-shaped, borderless, `var(--shadow-control)`
- `.leaflet-tooltip` — pill-shaped, borderless, bold ink text, same shadow

Markers are **`L.divIcon` with an HTML string**, not image assets. This matches
the circular badges used elsewhere and sidesteps Leaflet's well-known broken
default marker asset path under bundlers. Three icons in `kos-map.tsx`:
`scoreIcon()` (dynamic per kos), `draftIcon` (`action` "+") and `placeIcon`
(blue ring). Since Fase 3a the HTML carries **Tailwind classes** (`shadow-pin`,
`ACCENT_BG[accent]`, `size-[46px]`…) instead of inline hex: the strings live in
the source file, so Tailwind finds and generates them like any other class.

Because Leaflet panes carry their own stacking, map overlays use the z tokens:
the search box, the touch-lock pill and the toast are `z-(--z-map-overlay)`
(500); `AddKosDialog` is portalled and `z-(--z-dialog)`.

`.leaflet-container a` sets link colour with more specificity than a utility,
so a link button inside a popup needs `text-white!` to stay white.

**Popups** (`.leaflet-popup-content-wrapper` in `globals.css`) take the box
radius and `--shadow-float`, with 14×16px content margins. Build their content
from `<span className="block …">`, not `<p>`: Leaflet's CSS gives popup
paragraphs a 1.3em margin. Every kos pin opens one: name, area and city,
`KosScoreBadge`, price and review count, and a "Lihat kos" button to
`/kos/[id]` (a `local-` kos says "Belum tersimpan di database" instead). The
hover tooltip (name, city) renders only where `(hover: hover)` matches, so a
phone never gets a tooltip and a popup from one tap.

**Legend** (`MapLegend` in `map-section.tsx`), under the map on the ink band:
a dot per score band (teal, amber, rose-deep, ink ring for "Baru") with the
thresholds formatted from `SCORE_HIGH` / `SCORE_MID`, and the add-kos hint
that used to be a pill over the map, where it hid pins. On a phone the band
has `pb-28` because the amber seam circle reaches 100px up into it and would
sit under the legend's white text.

**Touch lock.** On a `(pointer: coarse)` device the map starts with dragging
and pinch disabled, so a finger scrolling the page is not caught by it. A
dark pill bottom-left reads "Ketuk untuk menggeser peta"; tapping it, or any
empty spot on the map, unlocks (that first tap never opens the add-kos
draft), and the pill turns into "Kunci peta". Pins, search and the zoom
buttons work while locked. A fine pointer never sees the pill, and the pointer
type is followed live, so a device that switches to a mouse unlocks at once.
The pill sits at `bottom-6` (clear of Leaflet's attribution line) with
`min-h-11`; the save toast moves up to `bottom-20` on touch so the two never
overlap. Edge-pin popups auto-pan inside `OVERLAY_INSET` at the top (never
under the search box) and 16px elsewhere.

**Zoom buttons are 44px on touch** (`.leaflet-container.leaflet-touch
.leaflet-bar a` in `globals.css`; Leaflet's own touch size is 30px).

## Copy language

**Indonesian, everywhere.** The site used to mix English marketing copy with
Indonesian app copy; UI/UX is 25% of the competition score and the mix read as
unfinished, so it was unified.

- Numbers go through `lib/format.ts`, which formats with `id-ID`:
  `Rp950.000`, `1,1 km`, `11.907`.
- `<html lang="id">`

## One section, one screen (laptop and up)

From `lg` (≥1024px) every landing section is **exactly one screen tall**
(except "Cara kerja" since 26 Sep 2026: its card grid and score panel from the
Claude Design file make it ~1,060px at 1280×800, by the user's choice) —
`lg:flex lg:min-h-svh lg:flex-col lg:justify-center`, content centred, inner
container `w-full`. The hero uses `lg:min-h-[calc(100svh-5.5rem)]` so hero +
navbar make one screen. Below `lg` heights follow the content (`px-4 py-section`);
a phone cannot hold six criteria or a card grid in one screen.

Measured to fit at 1440×900, 1280×800 and 1366×768. What made that possible:

- **`#browse` is one swipeable row** — `KosCarousel`
  ([`kos-carousel.tsx`](../src/components/ui/kos-carousel.tsx)): snap
  scrolling, three cards visible on `lg`, two on `sm`, 85% width on a phone
  (the next card peeks as a swipe hint). A toolbar above the row shows the
  position ("1-3 dari 9", the only place a phone learns how many are left)
  and, from `sm`, the ◀ ▶ buttons, each moving one visible page. The buttons
  used to sit on the row's edges and covered the outer cards. Cards stay
  server-rendered as children.
- **The map row takes its height from the screen**:
  `lg:h-[clamp(360px,calc(100svh-260px),640px)]` on the grid. The left
  column is the map (`flex-1`) with the legend row under it; the sidebar
  list scrolls inside. Everything else in the band measures ~240px (padding,
  heading, intro); 260 leaves room for an intro that wraps at 1024. Change it
  if the heading changes. Retuned in the Listing pass (was 345px): the map
  went from 423px to 444px tall at 1366×768 and to 576px at 1440×900.
- **`short:`** — a custom variant in `globals.css`,
  `(width >= 64rem) and (height <= 860px)`. Registered after the breakpoints,
  so it overrides `lg:`. Only `#browse` uses it now (140px card images).

Fase 4a added 1024×768 to the sizes checked; all five sections fit it too.

After changing any section's content, re-measure: every `main > section`
should be `innerHeight` tall at those three sizes (hero: `innerHeight − 88`, the navbar's 5.5rem).

## Responsive

Mobile-first with `sm:` / `lg:` breakpoints. Content is capped at
`max-w-page`. Headings use the fluid type tokens (`text-display`,
`text-title`) rather than breakpoint steps. The navbar's link list is
`hidden lg:flex`, replaced below `lg` by `MobileNav` — the competition rules
require the site to work at every screen size, so that menu is not optional.

**The navbar is sticky below `lg`** (`sticky top-0 lg:relative`). Every
anchored section — and the `#dampak` / `#scoring` halves — carries
`scroll-mt-24 lg:scroll-mt-0`, so a `SectionLink` lands just under the bar
instead of beneath it (measured: section top 96px, bar bottom 88px).

**Hero headline.** The phrases "orang yang pernah" and "tinggal di sana." are
`whitespace-nowrap` spans instead of `<br>`s, so lines break where the sentence
does. Two sizes keep that possible: `text-display` (`clamp(2rem, 10.5vw,
4.25rem)` — still on one line at 320px) and, from `lg` where the headline
shares a row with the hero card, `text-display-split` (`clamp(3rem, 5.4vw,
4.25rem)`), with the card column 400px until `xl` and 480px after. Recheck at
320, 1024 and 1280 if the headline copy changes.

**Icons.** `lucide-react`, first used in Fase 4a: one icon per criterion in
`HowItWorks` (`BedDouble`, `ShowerHead`, `Droplets`, `Wifi`, `CookingPot`,
`SquareParking`), `size-5`, `strokeWidth` 2, `aria-hidden`. Keep to lucide —
one icon family per project.

### Phone platform layer (Fase 5)

- **Viewport** (`layout.tsx` `viewport` export): `viewport-fit=cover`,
  `interactive-widget=resizes-content` (Android's keyboard shrinks the layout
  like iOS's), `themeColor` = cream (mirrors `--color-cream`; one value, no
  dark scheme), `colorScheme: "light"`. Zoom is never disabled.
- **Tap highlight:** Tailwind's preflight already sets it transparent on
  `html`. Leaflet re-adds a blue one to every map link; `html
  .leaflet-container a` removes it again.
- **`touch-action: manipulation`** on `a`, `button`, `label`, `summary`,
  `[role=button]`, `[role=tab]` (base layer): no double-tap-zoom wait.
- **Hover:** `hover:` needs `(hover: hover) and (pointer: fine)` (custom
  variant, Fase 7b). Every
  hover style on a control has an `active:` partner, because a finger only
  ever gets the press.
- **Small drawn, large target:** where a control must look smaller than 44px
  (the logo, the search's clear button), a `before:absolute before:-inset-1`
  pseudo-element takes the hit area to 44.
- **Scroll lock:** `useScrollLock()` (`components/ui/use-scroll-lock.ts`)
  pins `<body>` with `position: fixed` at the scroll offset and restores it on
  release — the lock iOS Safari honours.
- **No `overscroll-behavior` on `html`** — a scrolling document keeps
  pull-to-refresh. Inner scrollers set `overscroll-contain`.

The map is the one place where a fixed pixel inset breaks: `FitToKos` scales its
padding to the container, which is ~343px wide on a phone and ~800px on a
desktop.
