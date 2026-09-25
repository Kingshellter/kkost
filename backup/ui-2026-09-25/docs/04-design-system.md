# 04 · Design system

Everything is sampled from a design deck called **"Review Kos v5 Rounded"**.
The look: cream ground, navy ink, pill-shaped everything, soft lifted shadows,
big extrabold display type, decorative off-canvas circles.

## Tokens — Tailwind v4, CSS-first

There is **no `tailwind.config.js`**. All tokens live in an `@theme inline`
block in [`src/app/globals.css`](../src/app/globals.css), which means every
token is automatically a utility class *and* a CSS variable.

```css
--color-cream:      #f1ece3   /* page background */
--color-cream-deep: #e7e1d6   /* hairlines, dividers, input borders */
--color-ink:        #1c2a4e   /* primary text, dark sections */
--color-ink-soft:   #24345c   /* body copy */
--color-rose:       #f93a5a   /* primary action / brand */
--color-amber:      #fcb800   /* CTA section ground */
--color-amber-soft: #fcd056
--color-blue:       #3b59df
--color-sky:        #4fc3f7
--color-muted:      #7f8493   /* secondary text */
--color-lavender:   #d7d7e2   /* hero blob */

--font-sans / --font-display : var(--font-jakarta)

--radius-card:  28px
--radius-panel: 32px          /* used as rounded-[var(--radius-panel)] */

--shadow-lift:  0 18px 40px -18px rgb(28 42 78 / .28)
--shadow-float: 0 30px 70px -28px rgb(28 42 78 / .42)
```

Usage: colours as normal utilities (`bg-cream`, `text-ink`, `border-cream-deep`);
radii and shadows via arbitrary values (`rounded-[var(--radius-panel)]`,
`shadow-[var(--shadow-lift)]`).

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

`accentForScore(score)` bands the colour: `≥ 4.6 → rose`, `≥ 4.3 → amber`,
else `blue`. Used by map pins and the sidebar.

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

- `.leaflet-container` — cream-ish `#eee9e1` background, inherits the app font
- `.leaflet-tile-pane` — `filter: grayscale(.92) brightness(1.06) contrast(.9)`
  to wash OSM tiles down to the deck's muted basemap
- `.leaflet-control-zoom` — pill-shaped, borderless, lifted shadow
- `.leaflet-tooltip` — pill-shaped, borderless, bold ink text

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
