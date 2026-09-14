# 05 · File map

One line per file. `~n` is the approximate line count — a proxy for how much is
in there. Total source is ~2.5k lines, so reading any single file is cheap; this
map exists so you can read *only the right one*.

## App shell

| File | ~n | Owns |
|---|---|---|
| [`src/app/layout.tsx`](../src/app/layout.tsx) | 25 | Root layout. `lang="id"`, Jakarta font variable, `bg-cream text-ink`, site `metadata` (title/description) |
| [`src/app/page.tsx`](../src/app/page.tsx) | 60 | Route `/`. Loads the kos list, session and `searchParams`; parses the URL filter; fetches the featured kos's reviews; stacks Navbar + 7 sections |
| [`src/app/kos/[id]/page.tsx`](../src/app/kos/[id]/page.tsx) | 210 | Route `/kos/[id]`. Kos header, `ScoreProvenance` panel, per-facility averages, review list, and either the review form, a sign-in prompt, or "sudah menilai" |
| [`src/app/globals.css`](../src/app/globals.css) | 90 | Tailwind v4 `@theme inline` tokens, `eyebrow` utility, all Leaflet overrides |
| [`src/proxy.ts`](../src/proxy.ts) | 40 | Supabase session refresh; no-ops without env vars; matcher excludes static assets. Named `proxy`, not `middleware` — that convention is deprecated in Next 16 |

## Data & logic

| File | ~n | Owns |
|---|---|---|
| [`src/data/kos.ts`](../src/data/kos.ts) | 330 | Domain types — `Accent`, `FacilityScore`, `Kos`, `FACILITY_KEYS`, `FacilityKey`, `Review` (incl. `isDemo`) — plus static Indonesian copy (`INDONESIA`, `CRITERIA`, `NAV_LINKS`, `PROBLEMS`, `SDG_GOALS`, `TRUST_GUARANTEES`) and the `KOS_LIST` fallback |
| [`src/lib/kos-repository.ts`](../src/lib/kos-repository.ts) | 175 | **The only file that knows `kos` column names.** `isSupabaseConfigured`, `fetchKosList`, `fetchKos`, `saveKos`, `toKosRow`, `explain`, `toKos` (takes the saved uuid when there is one) |
| [`src/lib/review-repository.ts`](../src/lib/review-repository.ts) | 110 | **The only file that knows `reviews` column names.** `fetchReviews` (retries without `is_demo` before 0007), `saveReview` |
| [`src/lib/geocode.ts`](../src/lib/geocode.ts) | 110 | **The only file that talks to Nominatim.** `Place`, `GeocodeResult`, `searchPlaces` — keyless place lookup for the map search, results capped to Indonesia |
| [`src/lib/kos-browse.ts`](../src/lib/kos-browse.ts) | 115 | URL filter for the landing page: `SORTS`, `BUDGETS`, `KosFilter`, `parseKosFilter` (zod, never throws), `isNarrowed`, `hasFilter`, `applyKosFilter`, `cityOptions`, `summarizeKos` (the hero's live numbers) |
| [`src/lib/scores.ts`](../src/lib/scores.ts) | 17 | `averageFor(reviews, key)` — display-only per-facility mean, used by the hero card and the detail page |
| [`src/lib/auth.ts`](../src/lib/auth.ts) | 50 | `getSessionUser()` — the only trusted source of the current user. `isCampusEmail` |
| [`src/lib/auth-actions.ts`](../src/lib/auth-actions.ts) | 105 | `"use server"`: `signIn`, `signUp`, `signOut`, plus Indonesian error translation |
| [`src/lib/review-actions.ts`](../src/lib/review-actions.ts) | 70 | `"use server"`: `submitReview` — reads the author from the session, validates, revalidates both routes |
| [`src/lib/action-state.ts`](../src/lib/action-state.ts) | 22 | `useActionState` initial values and state types. Separate because a `"use server"` file may only export async functions |
| [`src/lib/format.ts`](../src/lib/format.ts) | 10 | `formatRupiah` (`Rp950.000`), `formatDistance` (`700 m` / `1,1 km`), `formatNumber` — all `id-ID` |
| [`src/store/kos-store.ts`](../src/store/kos-store.ts) | 22 | zustand store holding **only** the kos added this session; plus `mergeKos`, which the map and sidebar use to merge it with the server list without drawing a saved kos twice |
| [`src/utils/supabase/client.ts`](../src/utils/supabase/client.ts) | 7 | `createBrowserClient` factory |
| [`src/utils/supabase/server.ts`](../src/utils/supabase/server.ts) | 26 | `createServerClient` factory bound to `cookies()` |

## UI primitives — `src/components/ui/`

| File | ~n | Owns |
|---|---|---|
| [`accent.ts`](../src/components/ui/accent.ts) | 38 | `ACCENT_BG`, `ACCENT_ON`, `ACCENT_HEX`, `accentForScore` |
| [`score-badge.tsx`](../src/components/ui/score-badge.tsx) | 42 | Circular score chip, 3 sizes, optional text label. Generic — knows nothing about kos |
| [`kos-score-badge.tsx`](../src/components/ui/kos-score-badge.tsx) | 32 | `ScoreBadge` + the kos rule: `reviews === 0` renders a dark "Baru" chip instead of `0.0`. **Use this for any kos**, never `ScoreBadge` directly |
| [`kos-card.tsx`](../src/components/ui/kos-card.tsx) | 57 | Kos card for the browse grid; links to `/kos/[id]` |
| [`facility-bar.tsx`](../src/components/ui/facility-bar.tsx) | 26 | Labelled 0–5 progress bar |
| [`logo.tsx`](../src/components/ui/logo.tsx) | 12 | Wordmark |

## Sections — `src/components/sections/` (Server Components except `mobile-nav`)

| File | ~n | Anchor | Owns |
|---|---|---|---|
| [`navbar.tsx`](../src/components/sections/navbar.tsx) | 78 | — | Pill navbar. Reads the session: name + "Terverifikasi" badge + sign-out form, else a "Masuk" link. Desktop links hidden below `lg` |
| [`mobile-nav.tsx`](../src/components/sections/mobile-nav.tsx) | 88 | — | **Client.** Disclosure menu for `< lg`. Without it the site has no navigation on a phone |
| [`hero.tsx`](../src/components/sections/hero.tsx) | 200 | — | Headline, live stats eyebrow, city + budget GET form to `/#browse`, `HeroCard` (featured kos with its real per-facility averages and newest review as the quote, captioned when demo), decorative blobs |
| [`impact.tsx`](../src/components/sections/impact.tsx) | 110 | `#dampak` | Problem statement (`PROBLEMS`), one-line solution, `SDG_GOALS` cards |
| [`scoring.tsx`](../src/components/sections/scoring.tsx) | 41 | `#scoring` | The six `CRITERIA` as numbered circles in a 1/2/3-col grid |
| [`trust.tsx`](../src/components/sections/trust.tsx) | 62 | `#trust` | The competition theme argued on the page — `TRUST_GUARANTEES` as 2×2 cards, each naming where it is enforced |
| [`map-section.tsx`](../src/components/sections/map-section.tsx) | 55 | `#reviews` | Dark ink band; says how many kos match when `narrowed`; passes the filtered kos list to `<MapFrame/>` + `<KosSidebar/>`; fixes the map's height (380/460/520px) |
| [`browse.tsx`](../src/components/sections/browse.tsx) | 170 | `#browse` | Filter bar (kota / budget / urutkan) as a GET form, result count, reset link, every filtered kos as a `KosCard`, empty state |
| [`cta.tsx`](../src/components/sections/cta.tsx) | 105 | `#login` | Amber band; copy + either `<AuthCard/>` or a signed-in summary with the verification badge |

## Map — `src/components/map/` (all client)

| File | ~n | Owns |
|---|---|---|
| [`map-frame.tsx`](../src/components/map/map-frame.tsx) | 22 | The `dynamic(..., { ssr: false })` boundary + loading state. Exists only for that |
| [`kos-map.tsx`](../src/components/map/kos-map.tsx) | 300 | `MapContainer`, OSM `TileLayer`, bottom-right `ZoomControl`, `ClickCatcher`, `FitToKos` (auto-fit + `ResizeObserver`), `FocusPlace` (flies to a search result), `fitPadding`, the three `divIcon`s, draft marker + popup, draft/form/notice/place state, `handleSaved` |
| [`map-search.tsx`](../src/components/map/map-search.tsx) | 240 | Debounced place-search combobox overlaying the map's top-left — results list, keyboard navigation, loading/empty/error states, clear button. Calls `searchPlaces`; the parent owns the map move |
| [`kos-sidebar.tsx`](../src/components/map/kos-sidebar.tsx) | 52 | "N kos di peta" list (scrolls when long), each row linking to `/kos/[id]`; empty state for a filter with no match; "Lihat daftar lengkap" link |
| [`add-kos-dialog.tsx`](../src/components/map/add-kos-dialog.tsx) | 245 | Modal form — name, area, city, campus (optional), price, distance. zod + react-hook-form, Escape-to-close, scroll lock with scrollbar compensation, `saveKos` call, inline server error, unconfigured warning, local `Field` + `inputClass` helpers |

## Auth — `src/components/auth/`

| File | ~n | Owns |
|---|---|---|
| [`auth-card.tsx`](../src/components/auth/auth-card.tsx) | 145 | Client. Sign-in / sign-up tabs in one card, `useActionState`, inline error and notice |

## Reviews — `src/components/review/`

| File | ~n | Owns |
|---|---|---|
| [`review-form.tsx`](../src/components/review/review-form.tsx) | 140 | Client. Six 1–5 radio groups styled as pills, optional note, success state |
| [`review-list.tsx`](../src/components/review/review-list.tsx) | 78 | Server. One card per review: average badge, author + verified badge + "Review contoh" badge, date, note, six `FacilityBar`s. Also the empty state |

## Elsewhere

| Path | What |
|---|---|
| `supabase/migrations/0001_kos_location_fields.sql` | Location/price/score columns on `kos`. Run by hand |
| `supabase/migrations/0002_reviews.sql` | `profiles`, `reviews`, score-aggregation trigger, RLS on all three tables. Run by hand |
| `supabase/migrations/0003_city_and_campus.sql` | `city` + `campus` on `kos`, index on `city`. Run by hand |
| `supabase/migrations/0004_kos_insert_requires_login.sql` | Replaces the open `kos` INSERT policy with an authenticated-only one. Run by hand |
| `supabase/migrations/0005_linter_fixes.sql` | Closes every finding from Supabase's database linter: revokes public EXECUTE on the two SECURITY DEFINER trigger functions, wraps `auth.uid()` in a subquery in all policies, drops a duplicate legacy SELECT policy, indexes the `reviews.author_id` FK. Run by hand |
| `supabase/migrations/0006_column_grants.sql` | Column-level INSERT/UPDATE grants, so `kos.score`/`reviews`, `profiles.is_student` and `reviews.created_at`/`kos_id` cannot be written from the client; score trigger recomputes old and new kos; case-insensitive `.ac.id`. Run by hand |
| `supabase/migrations/0007_demo_profiles.sql` | `profiles.is_demo`, not writable by clients. Run by hand |
| `supabase/seed.sql` | Backfills the legacy rows and inserts kos across seven cities. Idempotent. Run by hand, before the demo reviews |
| `supabase/seed_demo_reviews.sql` | Four flagged demo accounts (no password, `.invalid` email) and 17 labelled reviews. Needs 0007. Idempotent. Run by hand, last |
| `.claude/launch.json` | Dev-server config for the preview tooling (`npm run dev`, port 3000) |
| `README.md` | Project README for the judges — pitch, SDG mapping, features, setup, team. Written in Indonesian |
| `.env.example` | The two required env vars |
| `AGENTS.md` / `CLAUDE.md` | Agent instructions. The Next.js block in `AGENTS.md` is regenerated by `next dev` — do not fight it |
| `Guidebook_Web_Development_Competition_SWITCHFEST_2026.pdf` | Competition rules |
| `eslint.config.mjs`, `postcss.config.mjs`, `next.config.ts` | Stock scaffolding; `next.config.ts` is empty |
| `public/` | Default create-next-app SVGs; unused by the design |
