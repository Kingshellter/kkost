# 01 · Overview

## Product

**kkost** — a review site for *kos* (student boarding houses) **across
Indonesia**. The pitch, verbatim from the page metadata:

> "Pilih kos dari orang yang pernah tinggal di dalamnya."
> Six facilities, scored one by one by students who paid the rent, across
> Indonesia. Owners can reply — they can never delete.

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
| Forms | react-hook-form + zod 4 + `@hookform/resolvers` | |
| Client state | zustand 5 | One tiny store |
| Icons | lucide-react | Installed; **not yet imported anywhere** |

## What actually works today

- ✅ Landing page at `/` — navbar, hero, scoring, map, top-rated, CTA
- ✅ **Kos detail page at `/kos/[id]`** — per-facility averages, review list,
  review form
- ✅ **Nationwide scope** — every kos stores its own `city` and optional
  `campus`; distance is entered by whoever adds the kos
- ✅ **Reads from Supabase**, with the hardcoded `KOS_LIST` as the fallback when
  the database is unreachable or empty
- ✅ **Auth** — email + password sign-up/sign-in via Supabase Auth, Server
  Actions, session in the navbar, sign-out. A `.ac.id` address flags the account
  as a verified student
- ✅ **Reviews** — six facility scores 1–5 per reviewer, one review per kos per
  person, `kos.score` recomputed by a database trigger
- ✅ Interactive map with score pins that **auto-fits to wherever the kos are**,
  plus the click-to-add flow
- ✅ "Add kos" dialog: validated form → Supabase insert → pin appears
- ✅ **Responsive navbar** with a mobile menu
- ✅ Graceful degradation with no Supabase credentials (demo data, session-scoped)
- ✅ Supabase session refresh in `src/proxy.ts`

## What does NOT exist yet

- ❌ **Owner replies.** The pitch says owners can reply but never delete; the
  RLS policies already make deletion impossible, but there is no replies table
  or UI.
- ❌ **Editing a review.** The 30-day window exists as an RLS policy; no UI uses it.
- ❌ **Search/filter.** The hero city field and `action="#browse"` just jump —
  nothing filters by city yet, even though the data now supports it.
- ❌ **`#owners` section.** `NAV_LINKS` points at an anchor nothing defines.
- ❌ **Real photos.** Cards render coloured `PHOTO` placeholders.
- ❌ **SDG section.** The competition scores "Kesesuaian dengan Tema" 15%; the
  six criteria map onto SDG 11 / 6 / 4 but the site never says so.
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
