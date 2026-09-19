# 01 · Overview

## Product

**kkost** — a review site for *kos* (student boarding houses) **across
Indonesia**. The pitch, verbatim from the page metadata:

> "Pilih kos dari orang yang pernah tinggal di dalamnya."
> Enam fasilitas, dinilai satu per satu oleh mahasiswa yang benar-benar
> membayar sewanya, di seluruh Indonesia. Pemilik kos tidak pernah bisa
> menghapus review.

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
| Icons | lucide-react | Installed; **not yet imported anywhere** |

## What actually works today

- ✅ Landing page at `/` — navbar, hero, impact (`#dampak`), scoring, trust,
  map, browse, CTA
- ✅ **Kos detail page at `/kos/[id]`** — per-facility averages, review list,
  review form
- ✅ **Nationwide scope** — every kos stores its own `city` and optional
  `campus`; distance is entered by whoever adds the kos
- ✅ **Reads from Supabase.** The hardcoded `KOS_LIST` is shown only on a
  checkout without credentials, under a "Mode contoh" notice. A database
  error shows an empty list and a notice — never the invented demo scores
- ✅ **Auth** — email + password sign-up/sign-in via Supabase Auth, Server
  Actions, session in the navbar, sign-out. A `.ac.id` address flags the account
  as a verified student
- ✅ **Reviews** — six facility scores 1–5 per reviewer, one review per kos per
  person, `kos.score` recomputed by a database trigger
- ✅ Interactive map with score pins that **auto-fits to wherever the kos are**,
  plus the click-to-add flow
- ✅ **Place search on the map** — type a street, neighbourhood, campus or
  landmark and the view flies there, with a blue pin marking it. Geocoded by
  Nominatim (OpenStreetMap), keyless like the tiles
- ✅ "Add kos" dialog: validated form → Supabase insert → pin appears
- ✅ **Responsive navbar** with a mobile menu
- ✅ **Filter & sort** — city, budget ceiling and sort order (score, price,
  distance to campus) live in the URL: `/?kota=&harga=&urut=#browse`. The hero
  search and the browse filter are plain GET forms, so it works without
  JavaScript and a result can be shared. The map, sidebar and grid all follow it
- ✅ **Honest headline numbers** — the hero's review / kos / city counts are
  counted from the data, and the hero card shows the featured kos's real
  per-facility averages and its newest written review
- ✅ **Problem statement and SDG mapping on the page** — the `#dampak` section
- ✅ **All copy in Indonesian**, numbers formatted `id-ID`
- ✅ **Labelled demo reviews** — `supabase/seed_demo_reviews.sql` seeds four
  accounts flagged `profiles.is_demo` (no password, `.invalid` email); every
  review they wrote is badged "Review contoh" and counted in the provenance
  panel
- ✅ **Migrations applied and the database live** — 11 kos across 9 cities, and
  Supabase's own security linter reports no schema findings (one Auth
  setting warning — see ⚠️ below). 0001–0008, `seed.sql` and
  `seed_demo_reviews.sql` are applied (17 labelled demo reviews over 8 kos,
  3 kos left unreviewed),
  so the column-level grants are live too (verified via
  `information_schema.column_privileges`)
- ✅ **Kos content limits in the database** — `0008_kos_constraints.sql` adds
  CHECK constraints (lengths, price, distance, an Indonesia bounding box) and
  `kos.created_by`. Applied and verified live (constraints, `auth.uid()`
  default, insert policy, no client grant on `created_by`); linter shows no
  new findings
- ✅ **The theme, argued on the page** — a `#trust` section listing each
  integrity guarantee and where it is enforced, plus a "dari mana angka ini"
  panel on every kos detail page
- ✅ Graceful degradation with no Supabase credentials (demo data under a
  "Mode contoh" notice, session-scoped)
- ✅ Supabase session refresh in `src/proxy.ts`

## What does NOT exist yet

- ❌ **Owner replies.** The pitch says owners can reply but never delete; the
  RLS policies already make deletion impossible, but there is no replies table
  or UI. The site no longer claims owners can reply — put that claim back only
  together with the feature.
- ❌ **Editing a review.** The 30-day window exists as an RLS policy; no UI uses it.
- ❌ **Real photos / photo upload.** Every kos shows a flat SVG illustration
  labelled "Ilustrasi" (`KosPhoto`). Planned next: upload via Supabase Storage,
  rendered inside `KosPhoto` with the illustration as fallback.
- ⚠️ **`is_student` is forgeable.** The flag is set from an `.ac.id` suffix
  alone. 0006 stops users editing it afterwards, but with Supabase's "Confirm
  email" turned off, anyone can still sign up with a campus address they do not
  own — which contradicts the verified-tenant badge and the
  trust section. Unresolved product decision.
- ⚠️ **Leaked password protection is off.** The only Supabase security
  advisor finding (WARN, `auth_leaked_password_protection`) is an Auth setting,
  not a schema problem: sign-up does not check passwords against
  HaveIBeenPwned. It is toggled in the Supabase dashboard, not in a migration.
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
