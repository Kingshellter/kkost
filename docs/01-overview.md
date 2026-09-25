# 01 · Overview

## Product

**kkost** — a review site for *kos* (student boarding houses) **across
Indonesia**. The pitch, verbatim from the page metadata:

> "Pilih kos dari orang yang pernah tinggal di dalamnya."
> Iklan kos ditulis pemiliknya. Di kkost, penghuni menilai enam fasilitas satu
> per satu, di seluruh Indonesia — dan pemilik kos tidak pernah bisa menghapus
> review.

The description used to say reviewers were students "who actually pay the
rent". Nothing verifies tenancy — a confirmed `.ac.id` address proves a
campus inbox, not a rental — so the claim was dropped in favour of stating the problem first.

The scoring model is the product's core idea: every reviewer rates **six fixed
facilities** 1–5, and the kos score is the plain unweighted average.

The six criteria (defined in `CRITERIA`, [`src/data/kos.ts`](../src/data/kos.ts)):

1. Room & bed
2. Bathroom
3. Water & power
4. WiFi
5. Kitchen
6. Parking

Context: this is a submission for the **SWITCHFEST 2026 Web Development
Competition** (guidebook PDF sits in the repo root). The theme is
**"NextGen Secure: Building the Future of Trusted Web Ecosystems"**, and the
brief also requires a contribution to at least one of the 17 SDGs.

That theme is the reason the integrity guarantees live in the database rather
than the UI — derived score columns, a generated `average`, no DELETE policy for
owners, a unique constraint for one-review-per-tenancy, identity re-read from
the session inside every Server Action. When touching any of that, remember it
is the submission's answer to the theme, not incidental plumbing. The root
`README.md` lists the guarantees; `03-data-model.md` documents how each is
enforced.

## Stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | **Next.js 16.3.3**, App Router | Not the Next.js in most training data — read `node_modules/next/dist/docs/` before using unfamiliar APIs. `middleware` is deprecated in favour of `proxy.ts`; `next typegen` regenerates `PageProps`/`LayoutProps` |
| React | 19.2.8 | Server Components by default |
| Language | TypeScript, `strict: true` | Path alias `@/*` → `./src/*` |
| Styling | **Tailwind CSS v4** | CSS-first config via `@theme inline` in `globals.css` — there is **no** `tailwind.config.js` |
| Font | `Plus_Jakarta_Sans` via `next/font/google` | Exposed as `--font-jakarta` |
| Backend | **Supabase** (`@supabase/supabase-js` + `@supabase/ssr`) | Postgres + Auth. Reads and writes both go through it |
| Map | **Leaflet 1.9 + react-leaflet 5** | Keyless OpenStreetMap raster tiles |
| Geocoding | **Nominatim** (OpenStreetMap), called over `fetch` | No SDK, no key, no env var — the place search keeps working on a bare checkout. Its usage policy is why the search box debounces; see [`src/lib/geocode.ts`](../src/lib/geocode.ts) |
| Forms | react-hook-form + zod 4 + `@hookform/resolvers` | |
| Client state | zustand 5 | One tiny store |
| Icons | lucide-react | Used since Fase 4a for the six criteria in `HowItWorks`; the only icon family |

## What actually works today

- ✅ Landing page at `/` — navbar, hero, **Cara kerja** (`#cara-kerja`:
  the problem on the left, the six criteria on the right), map (`#peta`),
  browse (`#browse`), sign-in (`#login`), footer. Redesigned in UI-revamp
  Fase 4a (25 Sep 2026): the old `#dampak` and `#scoring` sections were merged
  so the kos list starts at ±4,500px on a phone instead of ±6,800px (page
  9,254px → ±6,750px); both old anchors still land, on the two halves
- ✅ **Kos detail page at `/kos/[id]`** — header (name, location, price,
  score, a "Tulis review" / "Masuk untuk menulis" shortcut to the form),
  per-facility averages as bars, review list (six scores per review as a
  compact grid), **sign-in in place** (the `AuthCard` renders where the form
  goes; after signing in the page re-renders with the form, so the visitor
  never loses the kos), and an aside with "Dari mana angka ini" + **location**
  (OpenStreetMap link at the kos's coordinates, and "Lihat di peta kkost" →
  `/?kota=<city>#peta`). From `lg` the aside is a sticky right column. Footer
  on this page too. Redesigned in UI-revamp Fase 4a
- ✅ **Mobile pass (UI-revamp Fase 5, 25 Sep 2026)** — `viewport-fit=cover`
  with safe-area gutters (`px-gutter`), an iOS-proof scroll lock for the
  add-kos dialog, no tap flash on map links, instant taps (`touch-action:
  manipulation`), an `active:` state on every hovered control, and every
  control on `/`, `/kos/[id]` and the 404s at 44px or more. **Verified in
  emulation only; the real-phone checklist is in `08-roadmap.md`.**
- ✅ **Forms (UI-revamp Fase 4a Form, 25 Sep 2026)** — the sign-in card is a
  full ARIA tab list (arrow keys, `tabpanel`) with a show/hide password
  button, and switching tabs no longer carries the other mode's error; the
  review form shows "x dari 6 dinilai" with the running plain average, the
  1–5 scale ends ("Buruk … Sangat baik"), photo thumbnails instead of the
  browser's file row, its own "belum dinilai" check instead of browser
  bubbles, and a saved card that takes focus; the add-kos dialog lost the raw
  coordinates, gained a close button, and takes prices like "950.000" with a
  live Rupiah preview
- ✅ **Nationwide scope** — every kos stores its own `city` and optional
  `campus`. Distance to campus exists only on seeded kos; new ones show
  "Dekat <kampus>"
- ✅ **Reads from Supabase.** The hardcoded `KOS_LIST` is shown only on a
  checkout without credentials, under a "Mode contoh" notice. A database
  error shows an empty list and a notice — never the invented demo scores
- ✅ **Auth** — email + password sign-up/sign-in via Supabase Auth, Server
  Actions, session in the navbar, sign-out. A `.ac.id` address flags the account
  as a verified student
- ✅ **Reviews** — six facility scores 1–5 per reviewer, one review per kos per
  person, `kos.score` recomputed by a database trigger
- ✅ Interactive map with score pins that **auto-fits to wherever the kos are**,
  plus the click-to-add flow. **Every pin opens a popup** (score, price, "Lihat
  kos" → detail page), a **legend** under the map explains the pin colours,
  and **on a phone the map starts locked** so it does not trap scrolling (tap
  to unlock, "Kunci peta" to lock again). The sidebar list shows from `lg`
  only
- ✅ **Kos list** (`#browse`): a snap carousel with a "1-3 dari 9" position
  toolbar; below `lg` the filter folds behind a "Filter & urutkan" button
  (no JavaScript; opens by itself when a filter is set)
- ✅ **Place search on the map** — type a street, neighbourhood, campus or
  landmark and the view flies there, with a blue pin marking it. Geocoded by
  Nominatim (OpenStreetMap), keyless like the tiles
- ✅ "Add kos" dialog: area and city pre-filled from the clicked point
  (Nominatim reverse geocoding, editable) → validated form → Supabase insert →
  pin appears. No distance field
- ✅ **Responsive navbar** with a mobile menu — **sticky below `lg`** (the
  phone page is long; from `lg` it scrolls away with the one-screen sections).
  Links: Cara kerja, Peta, Cari kos
- ✅ **Filter & sort** — city, budget ceiling and sort order (score, price,
  distance to campus) live in the URL: `/?kota=&harga=&urut=#browse`. The hero
  search and the browse filter are plain GET forms, so it works without
  JavaScript and a result can be shared. The map, sidebar and grid all follow it
- ✅ **Honest headline numbers** — the hero's review / kos / city counts are
  counted from the data, and the hero card shows the featured kos's real
  per-facility averages and its newest written review
- ✅ **Problem statement on the page** — the left half of `#cara-kerja`
  (anchor `#dampak`). The SDG
  mapping lives only in the root `README.md` (the on-page `#sdg` section was
  removed 24 Sep 2026 at the team's request)
- ✅ **All copy in Indonesian**, numbers formatted `id-ID`
- ✅ **Labelled demo reviews** — `supabase/seed_demo_reviews.sql` seeds four
  accounts flagged `profiles.is_demo` (no password, `.invalid` email); every
  review they wrote is badged "Review contoh" and counted in the provenance
  panel
- ✅ **Migrations applied and the database live** — 11 kos across 9 cities, and
  Supabase's own security linter reports no schema findings (one Auth
  setting warning — see ⚠️ below). 0001–0010, `seed.sql` and
  `seed_demo_reviews.sql` are applied (17 labelled demo reviews over 8 kos,
  3 kos left unreviewed),
  so the column-level grants are live too (verified via
  `information_schema.column_privileges`)
- ✅ **Kos content limits in the database** — `0008_kos_constraints.sql` adds
  CHECK constraints (lengths, price, distance, an Indonesia bounding box) and
  `kos.created_by`. Applied and verified live (constraints, `auth.uid()`
  default, insert policy, no client grant on `created_by`); linter shows no
  new findings
- ✅ **The theme, argued on the page** — a "dari mana angka ini" panel on
  every kos detail page. The landing page's `#trust` section (four guarantee
  cards) was removed 24 Sep 2026 at the team's request; the guarantees are
  still listed in the root `README.md`
- ✅ Graceful degradation with no Supabase credentials (demo data under a
  "Mode contoh" notice, session-scoped)
- ✅ Supabase session refresh in `src/proxy.ts`
- ✅ **Review photos (code)** — while writing a review, the author may attach
  up to 3 JPG/PNG/WebP photos (≤ 2 MB each) as evidence. They appear only in
  that review's card, never as the kos banner — every kos picture is the
  labelled illustration. `0010_review_photos.sql` replaces 0009's kos photos
  and is **applied live** (19 Sep 2026; bucket, policies, grants and trigger
  verified; linter shows no new findings). A real upload by a signed-in user
  has not been tested yet — see `08-roadmap.md`
- ✅ **Email confirmation** — "Confirm email" is on and custom SMTP (Gmail app
  password) sends the link, so an `.ac.id` badge now requires owning the
  inbox. The link lands on `/auth/confirm`, which signs the user in and shows a
  `?konfirmasi=` notice on `/`. The account label is **"Mahasiswa"** or
  **"Publik"** (navbar, CTA card); review cards say "Mahasiswa terverifikasi".
  It proves a campus inbox, not tenancy. Tested end to end with a real inbox
  on 19 Sep 2026
- ✅ **Footer** on `/` — tagline, nav links, OpenStreetMap data credit
- ✅ **Indonesian error and 404 pages** (`app/error.tsx`, `app/not-found.tsx`,
  and `app/kos/[id]/not-found.tsx` for a missing kos), each with the navbar
  and footer (UI-revamp Fase 4, E-1), and basic security headers in
  `next.config.ts`
- ✅ **Map respects the URL filter for kos added this session**, the toast
  timer restarts on a second save, and a `local-` kos is not a dead link
- ✅ **`AddKosDialog` traps focus** and returns it to the map on close
- ✅ **One section per screen on a laptop** — every landing section is one
  screen tall from `lg` up (verified at 1440×900, 1280×800, 1366×768); the
  kos list is a swipeable carousel. Phones keep natural heights

- ✅ **Live at <https://kkost.vercel.app>** — Vercel project `kkost` (team
  ATOM), deployed from branch `ui-h-1`; both Supabase env vars set for
  Production before the build. Checked 24 Sep 2026: `/` reads live data (no
  "Mode contoh"), `/kos/[id]` 200, `/kos/salah` 404, security headers
  present, no runtime or console errors. Preview deployments have **no** env
  vars (Production only)

## What does NOT exist yet

- ❌ **Owner replies.** The pitch says owners can reply but never delete; the
  RLS policies already make deletion impossible, but there is no replies table
  or UI. The site no longer claims owners can reply — put that claim back only
  together with the feature.
- ❌ **Editing a review.** The 30-day window exists as an RLS policy; no UI uses it.
- ❌ **Photo moderation.** Nobody can delete a photo through the API — by
  design, like reviews — so removing an inappropriate one means the project
  owner deleting it (object and `review_photos` row) from the Supabase
  dashboard. Deleting a review removes its photo rows (cascade) but not the
  objects.
- ❌ **Adding photos to an existing review.** Photos are chosen in the review
  form only; there is no "add photos later".
- ⚠️ **Leaked password protection is off.** The only Supabase security
  advisor finding (WARN, `auth_leaked_password_protection`) is an Auth setting,
  not a schema problem: sign-up does not check passwords against
  HaveIBeenPwned. It is toggled in the Supabase dashboard, not in a migration
  — and only on the Pro plan; this project is on FREE, so it stays off.
- ❌ **Tests.** No test runner configured.

## Environment

`.env.local` (see `.env.example`):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Both are `NEXT_PUBLIC_*`, so both reach the browser — that is intended for the
publishable (anon) key. **Never** add a service-role key with a `NEXT_PUBLIC_`
prefix. Absent credentials is a supported state, not an error: see
`isSupabaseConfigured` in [`src/lib/kos-repository.ts`](../src/lib/kos-repository.ts).
