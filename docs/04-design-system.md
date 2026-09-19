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
| `KosCard` | `kos: Kos` | Card for the browse grid, linking to `/kos/[id]`. Renders `KosPhoto`, name, "area, city", the distance line when the kos has a `campus`, `ScoreBadge`, highlight pills, price + review count. |
| `KosPhoto` | `kos` (`name`, `photoAccent`, `photoUrl`), `className`, `showLabel`, `sizes` | **The only place that draws a kos picture.** With a `photoUrl` it renders `next/image` (`fill`, `object-cover`, `sizes` forwarded) under a "Foto pengguna" chip. Otherwise a flat SVG scene (bedroom / study / house / kitchen, chosen by `photoAccent`) on the accent colour, built from palette classes (`fill-ink`, `fill-white/90`…). Always carries an "Ilustrasi" chip and an `aria-label` saying it is not a real photo — `showLabel={false}` only where there is no room (the 68px hero avatar). Size and radius come from `className`. Remote images are allowed only from the `kos-photos` public path of the configured Supabase project (`images.remotePatterns` in `next.config.ts`, derived from `NEXT_PUBLIC_SUPABASE_URL`). |
| `FacilityBar` | spread `FacilityScore` | One labelled 0–5 bar. The label column is 108px, sized for the longest Indonesian criterion ("Kamar & kasur"). Width is `score/5 * 100%`; has `role="img"` + Indonesian `aria-label`. |
| `Logo` | `className?` | Rose "K" circle + "kkost" wordmark. |

All of them are Server Components — no `"use client"`, no hooks.

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

- The only English left is the name of where a guarantee is enforced on the
  trust cards (`Row level security`, `Unique constraint`, `Server action`) —
  those are the terms a reader would look up.
- Numbers go through `lib/format.ts`, which formats with `id-ID`:
  `Rp950.000`, `1,1 km`, `11.907`.
- `<html lang="id">`

## Responsive

Mobile-first with `sm:` / `lg:` breakpoints. Content is capped at
`max-w-[1240px]` (`max-w-[1160px]` in the scoring section). Section rhythm is
`px-4 py-24 sm:px-6 lg:px-10 lg:py-32`. Display headings use
`text-[clamp(...)]` rather than breakpoint steps. The navbar's link list is
`hidden lg:flex`, replaced below `lg` by `MobileNav` — the competition rules
require the site to work at every screen size, so that menu is not optional.

The map is the one place where a fixed pixel inset breaks: `FitToKos` scales its
padding to the container, which is ~343px wide on a phone and ~800px on a
desktop.
