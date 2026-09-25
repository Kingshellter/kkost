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
reads or presses.** Components still on `bg-rose` buttons and `text-rose`
errors are migrated in Fase 3.

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
| `--container-narrow` | `max-w-narrow` | 1160px | the scoring/impact width |

The 4px spacing base is Tailwind's default and unchanged.

### Radius

Rule: **controls are `rounded-full`; containers are `panel`; a picture inside a
panel is `media`; small boxes (notices, thumbnails, rows) are `box`.**

| Token | Utility | Value | Replaces |
|---|---|---|---|
| `--radius-panel` | `rounded-panel` | 2rem | `rounded-[var(--radius-panel)]`, `rounded-[32px]` |
| `--radius-media` | `rounded-media` | 1.25rem | `rounded-[22px]` |
| `--radius-box` | `rounded-box` | 1rem | `rounded-2xl` |
| `--radius-card` | — | 28px | **deprecated**, one use left (map search results) |

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
| `--enter-scale` | 0.96 | popover/dialog start (with opacity 0) — never from `scale(0)` |
| `--enter-y` | 8px | menu/toast start offset |

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
- **Hover is already touch-safe.** Tailwind v4 compiles `hover:` inside
  `@media (hover: hover)`, so a tap never leaves a card stuck lifted.
- **Reduced motion means less motion, not none.** Under
  `prefers-reduced-motion: reduce` the durations are kept (opacity and colour
  still ease, so a change stays followable) and only the movement tokens
  collapse: `--press-scale` and `--enter-scale` → 1, `--enter-y` → 0. A
  component built on these tokens is reduced-motion-safe for free.
- **Focus** is an `outline` of `--focus-width` (2px) at `--focus-offset` (2px)
  in `--color-focus`, not a border-colour change — an outline cannot fight a
  `box-shadow` and survives forced-colors mode. Applied in Fase 3b.

Durations and the movement/focus tokens are plain `:root` properties (Tailwind
has no namespace for them): `duration-(--duration-fast)`,
`scale-(--press-scale)`.

### Z-index

`:root` properties, used as `z-(--z-dialog)`: `--z-nav` 30, `--z-map-overlay`
500, `--z-dialog` 1000. Leaflet's panes stack up to ~400, which is why map
overlays jump to 500.

### How the tokens are consumed

`@theme inline` copies each value straight into its utility, and Tailwind only
emits a `--color-*`/`--radius-*` variable into the CSS when something refers to
it. So `var(--color-teal)` in a hand-written style may not exist at runtime —
use the utility (`bg-teal`), or `ACCENT_HEX` for Leaflet HTML. The `:root`
block (durations, z-index) is always emitted.

Legacy usage still in components until Fase 3: arbitrary values like
`rounded-[var(--radius-panel)]` and `shadow-[var(--shadow-lift)]` — both still
work.

`@utility eyebrow` defines the small uppercase pill used at the top of every
section. Use `eyebrow` + a ground/text pair, e.g.
`className="eyebrow bg-white text-rose"`.

## The accent system

[`src/components/ui/accent.ts`](../src/components/ui/accent.ts) maps the
`Accent` union to concrete values. Three separate maps, because three contexts:

| Map | Returns | For |
|---|---|---|
| `ACCENT_BG` | `"bg-rose"` etc. | Tailwind class on an element |
| `ACCENT_ON` | `"text-white"` / `"text-ink"` / `"text-amber"` | legible text on that ground |
| `ACCENT_HEX` | `"#f93a5a"` etc. | inline styles, Leaflet `divIcon` HTML, canvas |

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
| `ScoreBadge` | `score`, `size` (`sm`/`md`/`lg`), `accent`, `label`, `className` | The generic circular chip. Pass `label` to show text instead of the number. Colours are inline styles from `ACCENT_HEX`, not classes. |
| `KosScoreBadge` | `kos`, `size`, `className` | **The one to use for a kos.** Applies the `reviews === 0 → dark "Baru"` rule and picks the accent from the score. Wrapping this in a component is not decoration: the rule used to be spelled out at four call sites, two drifted, and unreviewed kos rendered `0.0` on cards and the hero while the sidebar said "Baru". |
| `KosCard` | `kos: Kos` | Card for the browse grid, linking to `/kos/[id]`. Renders `KosPhoto`, name, "area, city", the campus line (`formatCampus`) when the kos has a `campus`, `ScoreBadge`, highlight pills, price + review count. |
| `KosPhoto` | `kos` (`name`, `photoAccent`), `className`, `showLabel` | **The only place that draws a kos picture** — always a flat SVG scene (bedroom / study / house / kitchen, chosen by `photoAccent`) on the accent colour, built from palette classes (`fill-ink`, `fill-white/90`…). Carries an "Ilustrasi" chip and an `aria-label` saying it is not a real photo — `showLabel={false}` only where there is no room (the 68px hero avatar). Size and radius come from `className`. Real photos are not kos pictures: they belong to reviews and render in `ReviewPhotos` inside `review-list.tsx` (3-column square grid, `next/image`, each opening full size). Remote images are allowed only from the `review-photos` public path of the configured Supabase project (`images.remotePatterns`, derived from `NEXT_PUBLIC_SUPABASE_URL`). |
| `FacilityBar` | spread `FacilityScore` | One labelled 0–5 bar. The label column is 108px, sized for the longest Indonesian criterion ("Kamar & kasur"). Width is `score/5 * 100%`; has `role="img"` + Indonesian `aria-label`. |
| `Logo` | `className?` | Rose "K" circle + "kkost" wordmark. |
| `SectionLink` | `Link` props, `href: "/#…"` | Link to a landing-page section. **Always root the hash at `/`** — the navbar also renders on `/kos/[id]`, where a bare `#login` only changes the URL. On `/` it scrolls to the element itself, because `Link` does nothing when the clicked hash is already in the URL. The one client component here. Also used for the CTA and sidebar "#browse" links and the map popup's "Masuk atau daftar". |

All of them are Server Components — no `"use client"`, no hooks — except `SectionLink`, which needs `usePathname`.

## Decorative circles

`aria-hidden`, `pointer-events-none` blobs and thick rings. Two kinds:

- **Inside one section** (hero amber, map-band ring and blob, CTA amber-soft):
  may run off the screen's left or right edge, **never** the section's top or
  bottom — every coloured section is `overflow-hidden`, so a circle crossing
  the seam gets sliced by a hard line. Keep ≥ 40px from the top and bottom:
  `.drift` moves them ±40px.
- **Across a seam** — `BoundaryCircle` ([`boundary-circle.tsx`](../src/components/ui/boundary-circle.tsx)).
  Rendered twice, `edge="bottom"` in the upper section and `edge="top"` in
  the lower one, with the same `SEAMS` entry, so each section clips its own
  half and the two read as one circle over the seam. This is the only way to
  cross a seam: one element would be sliced, or would sit on top of the next
  section's text. Both sections need `relative overflow-hidden`, and the
  section's content wrapper needs `relative` so it paints over the circle.
  Current seams: hero → `#dampak` (lavender), map band → `#browse` (amber),
  `#browse` → `#login` (ring). The smallest has an 80px radius, which is why
  `.drift-page` moves only ±32px.

Check 375, 1024 and 1440px after moving any circle.

## Motion

Both in [`globals.css`](../src/app/globals.css), both disabled under
`prefers-reduced-motion: reduce`:

- **Smooth scrolling only on a click** — `SectionLink` calls
  `scrollIntoView({ behavior: "smooth" })` when it is clicked on `/`.
  **Never set `scroll-behavior: smooth` on `html`**: that also animates every
  page load that carries a hash, and the browse and hero filters are GET forms
  that reload `/?kota=…#browse` — the page visibly slid down from the top on
  every "Terapkan". Page loads land on the section instantly.
- **`.reveal`** — fades a block up 40px as it enters the viewport, as a
  scroll-driven animation (`animation-timeline: view()`, range `entry 0%` to
  `entry 40%`). Behind `@supports`, so a browser without scroll timelines shows
  the content untouched rather than hidden. Put it on a section's inner
  container, not on the coloured `<section>` itself, and not on the hero —
  it is above the fold. Currently on `#dampak`, `#scoring`, the map
  band, `#browse` and `#login`.
- **`.drift`** — a circle inside one section moves from +40px to −40px while
  that section crosses the screen (`view()` timeline).
- **`.drift-page`** — the two halves of a `BoundaryCircle`, +32px → −32px and
  scale 0.9 → 1.1 over the whole page (`scroll(root)` timeline). A shared
  timeline is the point: per-element `view()` timelines would move the two
  halves by different amounts and split the circle at the seam.

## Leaflet styling

Leaflet ships its own CSS and paints its own containers, so `globals.css`
overrides it:

- `.leaflet-container` — `var(--color-map)` (`#eee9e1`) background, inherits
  the app font. `map-frame.tsx` still hardcodes the same hex for its loading
  placeholder (Fase 3)
- `.leaflet-tile-pane` — `filter: grayscale(.92) brightness(1.06) contrast(.9)`
  to wash OSM tiles down to the deck's muted basemap
- `.leaflet-control-zoom` — pill-shaped, borderless, `var(--shadow-control)`
- `.leaflet-tooltip` — pill-shaped, borderless, bold ink text, same shadow

Markers are **`L.divIcon` with inline HTML**, not image assets. This matches the
circular badges used elsewhere and sidesteps Leaflet's well-known broken default
marker asset path under bundlers. Two icons in `kos-map.tsx`: `scoreIcon()`
(dynamic per kos) and `draftIcon` (rose "+").

Because Leaflet panes carry their own stacking, map overlays use explicit high
z-index: the hint pill and toast are `z-[500]`, and `AddKosDialog` is `z-[1000]`.

## Copy language

**Indonesian, everywhere.** The site used to mix English marketing copy with
Indonesian app copy; UI/UX is 25% of the competition score and the mix read as
unfinished, so it was unified.

- Numbers go through `lib/format.ts`, which formats with `id-ID`:
  `Rp950.000`, `1,1 km`, `11.907`.
- `<html lang="id">`

## One section, one screen (laptop and up)

From `lg` (≥1024px) every landing section is **exactly one screen tall** —
`lg:flex lg:min-h-svh lg:flex-col lg:justify-center`, content centred, inner
container `w-full`. The hero uses `lg:min-h-[calc(100svh-5.5rem)]` so hero +
navbar make one screen. Below `lg` heights follow the content (`px-4 py-24`);
a phone cannot hold six criteria or a card grid in one screen.

Measured to fit at 1440×900, 1280×800 and 1366×768. What made that possible:

- **`#browse` is one swipeable row** — `KosCarousel`
  ([`kos-carousel.tsx`](../src/components/ui/kos-carousel.tsx)): snap
  scrolling, three cards visible on `lg`, two on `sm`, 85% width on a phone
  (the next card peeks as a swipe hint); ◀ ▶ buttons from `sm`, each moving
  one visible page. Cards stay server-rendered as children.
- **The map row takes its height from the screen**:
  `lg:h-[clamp(360px,calc(100svh-345px),600px)]` on the grid, map and sidebar
  `h-full`, the sidebar list scrolls inside. 345px is everything else in the
  band — change it if the heading changes.
- **`short:`** — a custom variant in `globals.css`,
  `(width >= 64rem) and (height <= 860px)`. Registered after the breakpoints,
  so it overrides `lg:`. Only the dense sections use it: `#scoring` (smaller
  number circles), `#browse` (140px card images), `#dampak` (less padding).

After changing any section's content, re-measure: every `main > section`
should be `innerHeight` tall at those three sizes (hero: `innerHeight − 87`).

## Responsive

Mobile-first with `sm:` / `lg:` breakpoints. Content is capped at
`max-w-[1240px]` (`max-w-[1160px]` in the scoring section). Display headings use
`text-[clamp(...)]` rather than breakpoint steps. The navbar's link list is
`hidden lg:flex`, replaced below `lg` by `MobileNav` — the competition rules
require the site to work at every screen size, so that menu is not optional.

The map is the one place where a fixed pixel inset breaks: `FitToKos` scales its
padding to the container, which is ~343px wide on a phone and ~800px on a
desktop.
