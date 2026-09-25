# 05 · File map

One line per file. `~n` is the approximate line count — a proxy for how much is
in there. Total source is ~2.5k lines, so reading any single file is cheap; this
map exists so you can read *only the right one*.

## App shell

| File | ~n | Owns |
|---|---|---|
| [`src/app/layout.tsx`](../src/app/layout.tsx) | 49 | Root layout. `lang="id"`, Jakarta font variable, `bg-cream text-ink`, site `metadata` (title/description), and the `viewport` export (`viewport-fit=cover`, `interactive-widget=resizes-content`, cream `themeColor`) |
| [`src/app/page.tsx`](../src/app/page.tsx) | 140 | Route `/`. Renders `ConfirmNotice` for `?konfirmasi=`. Loads the kos list (and its `source`), session and `searchParams`; renders `DataNotice` when not showing the real database; parses the URL filter; fetches the featured kos's reviews; stacks Navbar + 6 sections |
| [`src/app/kos/[id]/page.tsx`](../src/app/kos/[id]/page.tsx) | 300 | Route `/kos/[id]`. Two-column grid from `lg` (sticky aside right). Back link, header (`KosPhoto` banner, name, location, price, score, "Tulis review" + "Lihat lokasi" anchors), per-facility averages as `FacilityBar`s, aside (`ScoreProvenance`, `KosLocation`: OSM + `/?kota=…#peta` links), review list (`#ulasan`), and at `#tulis-review` either an inline `AuthCard` or `ReviewForm` (which itself shows "tersimpan" / "sudah menilai"). `Footer` |
| [`src/app/globals.css`](../src/app/globals.css) | 342 | Tailwind v4 `@theme inline` tokens, `px-gutter` / `pb-safe` safe-area utilities, base `touch-action: manipulation` on controls, `eyebrow` utility, motion tokens (no scroll-driven effects since Fase 6), all Leaflet overrides |
| [`src/app/error.tsx`](../src/app/error.tsx) | 64 | Client error boundary in Indonesian: `NavbarFrame` (no account slot), `StatusCard` with "Coba lagi" (`retry()`, the Next 16 prop name) and a home link, the error digest, `Footer`. Logs the error; React `<title>` "Gagal dimuat · kkost". Shown when `fetchKos` throws |
| [`src/app/auth/confirm/route.ts`](../src/app/auth/confirm/route.ts) | 55 | `GET` handler for the sign-up confirmation link: `verifyOtp` (`token_hash`) or `exchangeCodeForSession` (`code`), then redirects to `/?konfirmasi=berhasil\|masuk\|gagal#login`. Exports the `ConfirmOutcome` type |
| [`src/app/not-found.tsx`](../src/app/not-found.tsx) | 38 | 404 for URLs that match no route: navbar, `StatusCard` "Halaman tidak ditemukan" ("Cari kos", "Ke beranda"), footer. `metadata` sets the title |
| [`src/app/kos/[id]/not-found.tsx`](../src/app/kos/[id]/not-found.tsx) | 38 | 404 for `notFound()` in the kos page: "Kos ini tidak ditemukan" ("Lihat semua kos", "Buka peta"), navbar, footer |
| [`src/proxy.ts`](../src/proxy.ts) | 40 | Supabase session refresh; no-ops without env vars; matcher excludes static assets. Named `proxy`, not `middleware` — that convention is deprecated in Next 16 |

## Data & logic

| File | ~n | Owns |
|---|---|---|
| [`src/data/kos.ts`](../src/data/kos.ts) | 243 | Domain types — `Accent`, `FacilityScore`, `Kos`, `FACILITY_KEYS`, `FacilityKey`, `Review` (incl. `isDemo`) — plus static Indonesian copy (`INDONESIA`, `CRITERIA`, `NAV_LINKS`, `PROBLEMS`) and the `KOS_LIST` fallback |
| [`src/lib/kos-repository.ts`](../src/lib/kos-repository.ts) | 215 | **The only file that knows `kos` column names.** `isSupabaseConfigured`, `KosSource`, `fetchKosList` (returns `{ kos, source }`), `fetchKos` (throws on a DB error), `photoAccentFor` (id hash), `saveKos`, `toKosRow`, `explain`, `toKos` (takes the saved uuid when there is one) |
| [`src/lib/review-photo-repository.ts`](../src/lib/review-photo-repository.ts) | 115 | **The only file that knows `review_photos` columns and the `review-photos` bucket.** Limits (`PHOTO_MAX_BYTES`, `PHOTO_MAX_COUNT` = 3, `PHOTO_TYPES`), `checkPhotoFile`, `REVIEW_PHOTOS_EMBED`, `photoUrls`, `uploadReviewPhotos` (browser; object then row, per file) |
| [`src/lib/review-repository.ts`](../src/lib/review-repository.ts) | 135 | **The only file that knows `reviews` column names.** `fetchReviews` (embeds `review_photos`; retries without it before 0010 and without `is_demo` before 0007), `saveReview` |
| [`src/lib/geocode.ts`](../src/lib/geocode.ts) | 110 | **The only file that talks to Nominatim.** `Place`, `GeocodeResult`, `searchPlaces`, `reverseGeocode` (point → area + city, "Kota"/"Kabupaten" stripped) — keyless place lookup for the map search, results capped to Indonesia |
| [`src/lib/kos-browse.ts`](../src/lib/kos-browse.ts) | 115 | URL filter for the landing page: `SORTS`, `BUDGETS`, `KosFilter`, `parseKosFilter` (zod, never throws), `isNarrowed`, `hasFilter`, `matchesKosFilter`, `applyKosFilter`, `cityOptions`, `summarizeKos` (the hero's live numbers) |
| [`src/lib/scores.ts`](../src/lib/scores.ts) | 17 | `averageFor(reviews, key)` — display-only per-facility mean, used by the hero card and the detail page |
| [`src/lib/motion.ts`](../src/lib/motion.ts) | 17 | `durationMs("--duration-fast")` — a motion token's duration in ms, read from the CSS variable; exit timers use it so they never disagree with the transition |
| [`src/lib/auth.ts`](../src/lib/auth.ts) | 50 | `getSessionUser()` — the only trusted source of the current user. `isCampusEmail` |
| [`src/lib/auth-actions.ts`](../src/lib/auth-actions.ts) | 105 | `"use server"`: `signIn`, `signUp`, `signOut`, plus Indonesian error translation |
| [`src/lib/review-actions.ts`](../src/lib/review-actions.ts) | 70 | `"use server"`: `submitReview` — reads the author from the session, validates, revalidates both routes, returns the new `reviewId` |
| [`src/lib/action-state.ts`](../src/lib/action-state.ts) | 22 | `useActionState` initial values and state types. Separate because a `"use server"` file may only export async functions |
| [`src/lib/format.ts`](../src/lib/format.ts) | 10 | `formatRupiah` (`Rp950.000`), `formatDistance` (`700 m` / `1,1 km`), `formatCampus` (`700 m ke UGM` / `Dekat UGM`), `formatNumber` — all `id-ID` |
| [`src/store/kos-store.ts`](../src/store/kos-store.ts) | 22 | zustand store holding **only** the kos added this session; plus `mergeKos`, which the map and sidebar use to merge it with the server list without drawing a saved kos twice, applying the URL filter to the added kos |
| [`src/utils/supabase/client.ts`](../src/utils/supabase/client.ts) | 7 | `createBrowserClient` factory |
| [`src/utils/supabase/server.ts`](../src/utils/supabase/server.ts) | 26 | `createServerClient` factory bound to `cookies()` |

## UI primitives — `src/components/ui/`

| File | ~n | Owns |
|---|---|---|
| [`accent.ts`](../src/components/ui/accent.ts) | 56 | `ACCENT_BG`, `ACCENT_ON`, `ACCENT_HEX`, `accentForScore` + `SCORE_HIGH`/`SCORE_MID` |
| [`controls.ts`](../src/components/ui/controls.ts) | 91 | `buttonClass()` and the field class strings (`INPUT_CLASS`, `SELECT_CLASS`, `TEXTAREA_CLASS`, `LABEL_CLASS`, `FIELD_ERROR_CLASS`, `NOTICE_CLASS`). Every button and form field takes its classes from here |
| [`spinner.tsx`](../src/components/ui/spinner.tsx) | 14 | `Spinner` — the loading mark inside a busy button (with `aria-busy`) |
| [`field.tsx`](../src/components/ui/field.tsx) | 41 | `Field` — label + hint + description + error around one form control |
| [`status-card.tsx`](../src/components/ui/status-card.tsx) | 40 | `StatusCard` — the centred card for 404 and error pages |
| [`use-scroll-lock.ts`](../src/components/ui/use-scroll-lock.ts) | 48 | `useScrollLock()` — freezes the page behind a modal (body `position: fixed` at the scroll offset, restored on release; works on iOS) with scrollbar compensation |
| [`criterion-icon.ts`](../src/components/ui/criterion-icon.ts) | 23 | `CRITERION_ICON` — one lucide icon per facility key |
| [`score-badge.tsx`](../src/components/ui/score-badge.tsx) | 42 | Circular score chip, 3 sizes, optional text label. Generic — knows nothing about kos |
| [`kos-score-badge.tsx`](../src/components/ui/kos-score-badge.tsx) | 32 | `ScoreBadge` + the kos rule: `reviews === 0` renders a dark "Baru" chip instead of `0.0`. **Use this for any kos**, never `ScoreBadge` directly |
| [`kos-card.tsx`](../src/components/ui/kos-card.tsx) | 60 | Kos card for the browse carousel; links to `/kos/[id]` |
| [`kos-carousel.tsx`](../src/components/ui/kos-carousel.tsx) | 128 | **Client.** `KosCarousel` — one snap-scrolling row of server-rendered cards, with a toolbar above it: position ("1-3 dari 9") and ◀ ▶ page buttons (from `sm`), so `#browse` fits one screen |
| [`kos-photo.tsx`](../src/components/ui/kos-photo.tsx) | 150 | `KosPhoto` — labelled SVG illustration per kos (4 scenes keyed by `photoAccent`). Kos have no photos; photos belong to reviews |
| [`facility-bar.tsx`](../src/components/ui/facility-bar.tsx) | 23 | Labelled 0–5 progress bar |
| [`logo.tsx`](../src/components/ui/logo.tsx) | 12 | Wordmark |
| [`boundary-circle.tsx`](../src/components/ui/boundary-circle.tsx) | 45 | `BoundaryCircle` + `SEAMS` — a decorative circle drawn as two halves, one in each of two adjacent sections, so it sits whole across the seam |
| [`section-link.tsx`](../src/components/ui/section-link.tsx) | 35 | **Client.** `SectionLink` — a `Link` to a `/#section` that scrolls itself on `/`, where `Link` ignores a click on the hash already in the URL. Used by the navbar and mobile menu |

## Sections — `src/components/sections/` (Server Components except `mobile-nav`)

| File | ~n | Anchor | Owns |
|---|---|---|---|
| [`navbar.tsx`](../src/components/sections/navbar.tsx) | 40 | — | Async. Reads the session and fills `NavbarFrame`'s account slot: name + "Mahasiswa" badge (students only) + sign-out form, else a "Masuk" link |
| [`navbar-frame.tsx`](../src/components/sections/navbar-frame.tsx) | 57 | — | The navbar markup without the account: pill, logo, desktop links (from `lg`), `MobileNav`, `account` slot. Synchronous and client-safe, so `error.tsx` can render it |
| [`mobile-nav.tsx`](../src/components/sections/mobile-nav.tsx) | 107 | — | **Client.** Disclosure menu for `< lg`, always mounted; grows from the hamburger corner and shrinks back (`data-open`, `invisible` when closed). Without it the site has no navigation on a phone. `signedIn: boolean \| null`; "Masuk" only when `false` |
| [`hero.tsx`](../src/components/sections/hero.tsx) | 204 | — | Headline, live stats eyebrow, city + budget GET form to `/#browse`, `HeroCard` (featured kos with its real per-facility averages and newest review as the quote, captioned when demo), decorative blobs |
| [`how-it-works.tsx`](../src/components/sections/how-it-works.tsx) | 89 | `#cara-kerja` (+ `#dampak`, `#scoring`) | One screen: the problem (`PROBLEMS` as a compact list) on the left, the six `CRITERIA` with lucide icons on the right, the one-line solution. Replaced `impact.tsx` + `scoring.tsx` in Fase 4a |
| [`footer.tsx`](../src/components/sections/footer.tsx) | 50 | — | Logo + tagline, `NAV_LINKS`, OpenStreetMap data credit. Rendered on `/` only for now |
| [`map-section.tsx`](../src/components/sections/map-section.tsx) | 101 | `#peta` | Dark ink band; says how many kos match when the filter narrows; passes the filtered kos list and the `filter` to `<MapFrame/>` + `<KosSidebar/>`; fixes the map's height (440/460px, screen-derived on lg); `MapLegend` (pin colours + add-kos hint) under the map |
| [`browse.tsx`](../src/components/sections/browse.tsx) | 200 | `#browse` | Filter bar (kota / budget / urutkan) as a GET form — folded behind a "Filter & urutkan" checkbox-label below `lg` (`filterSummary`), result count, reset link, every filtered kos as a `KosCard` in a `KosCarousel`, empty state |
| [`cta.tsx`](../src/components/sections/cta.tsx) | 105 | `#login` | Amber band; copy + either `<AuthCard/>` or a signed-in summary with the verification badge |

## Map — `src/components/map/` (all client)

| File | ~n | Owns |
|---|---|---|
| [`map-frame.tsx`](../src/components/map/map-frame.tsx) | 22 | The `dynamic(..., { ssr: false })` boundary + loading state. Exists only for that |
| [`kos-map.tsx`](../src/components/map/kos-map.tsx) | 537 | `MapContainer`, `OVERLAY_INSET` (fit padding under the search box), OSM `TileLayer`, bottom-right `ZoomControl`, `ClickCatcher`, `FitToKos` (auto-fit + `ResizeObserver`), `FocusPlace` (flies to a search result; jumps under reduced motion), `TouchLock` + the lock pill (coarse pointers), a `Popup` per kos pin ("Lihat kos"), hover-only tooltips, `fitPadding`, the three `divIcon`s, draft marker + popup, draft/form/notice/place state, `handleSaved` (toast timer in a ref), `mapBox` ref for returning focus |
| [`map-search.tsx`](../src/components/map/map-search.tsx) | 270 | Debounced place-search combobox overlaying the map's top-left — results list, keyboard navigation, loading/empty/error states, clear button. Calls `searchPlaces`; the parent owns the map move |
| [`kos-sidebar.tsx`](../src/components/map/kos-sidebar.tsx) | 79 | **`lg` only.** "N kos di peta" list (scrolls inside the map row's height), each row linking to `/kos/[id]` — except a `local-` kos, which has no page; empty state for a filter with no match; "Lihat daftar lengkap" link |
| [`add-kos-dialog.tsx`](../src/components/map/add-kos-dialog.tsx) | 368 | Modal form — name, area, city, campus (optional), price. Area and city pre-filled by `reverseGeocode` from the clicked point. zod + react-hook-form with `noValidate`; price is a text field (`inputMode="numeric"`, digits pulled out, so "950.000" works) with a live `formatRupiah` preview via `useWatch`. Close button, Escape-to-close, Tab focus trap, focus returned to the map on close, `useScrollLock()`, `saveKos` call, inline server error, unconfigured warning |

## Auth — `src/components/auth/`

| File | ~n | Owns |
|---|---|---|
| [`auth-card.tsx`](../src/components/auth/auth-card.tsx) | 240 | Client. Sign-in / sign-up as an ARIA tab list (roving tabindex, arrows/Home/End) over a `tabpanel` form. `AuthForm` is keyed by mode, so each mode has its own `useActionState` (no stale error); email and name live in `AuthCard` and survive the switch. Show/hide password button |

## Reviews — `src/components/review/`

| File | ~n | Owns |
|---|---|---|
| [`review-form.tsx`](../src/components/review/review-form.tsx) | 490 | Client. Owns all three states: form, `SavedCard` (focused on mount, "Lihat review" → `#ulasan`), and "sudah menilai" (`alreadyReviewed`). Form: `Progress` ("x dari 6 dinilai" + running average, bar via `scaleX`), six `ScoreInput` pill groups with criterion icons and a "Buruk … Sangat baik" scale, note, `PhotoPicker` (dashed target + thumbnails with 44px remove buttons). `noValidate` + own unscored check. `submitWithPhotos` wraps the Server Action and uploads the photos from the browser once it returns the review id |
| [`review-list.tsx`](../src/components/review/review-list.tsx) | 127 | Server. One card per review: average badge, author + verified badge + "Review contoh" badge, date, note, `ReviewPhotos` (up to 3 thumbnails, each opens full size), the six scores as a compact 2/3-column grid (criterion-colour dot, label, number). Also the empty state |

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
| `supabase/migrations/0008_kos_constraints.sql` | CHECK constraints on every user-entered `kos` column (lengths, price, distance, Indonesia bbox), `kos.created_by` filled from `auth.uid()` and not client-writable, insert policy checks it. Run by hand |
| `supabase/migrations/0009_kos_photos.sql` | Kos photos: `kos-photos` bucket, `kos_photos` table. Applied live, then **superseded by 0010**, which drops the table and its upload policy |
| `supabase/migrations/0010_review_photos.sql` | Photos belong to reviews: drops `kos_photos`; `review-photos` bucket (public, 2 MB, jpeg/png/webp); upload policy limited to the uploader's own review folder; `review_photos` table with column grants; trigger enforcing ownership of the object and at most 3 per review. Run by hand — applied live |
| `supabase/seed.sql` | Backfills the legacy rows and inserts kos across seven cities. Idempotent. Run by hand, before the demo reviews |
| `supabase/seed_demo_reviews.sql` | Four flagged demo accounts (no password, `.invalid` email) and 17 labelled reviews. Needs 0007. Idempotent. Run by hand, last |
| `.claude/launch.json` | Dev-server config for the preview tooling (`npm run dev`, port 3000) |
| `README.md` | Project README for the judges — pitch, SDG mapping, features, setup, team. Written in Indonesian |
| `.env.example` | The two required env vars |
| `AGENTS.md` / `CLAUDE.md` | Agent instructions. The Next.js block in `AGENTS.md` is regenerated by `next dev` — do not fight it |
| `Guidebook_Web_Development_Competition_SWITCHFEST_2026.pdf` | Competition rules |
| `backup/ui-2026-09-25/` | Frozen copy of the whole `src/`, `public/`, styling configs and design-system doc as of commit `88e5694`, taken before the UI redesign. Reference/restore only — excluded from `tsconfig.json` and `eslint.config.mjs`; never import from it. Its `README.md` says how to restore |
| `eslint.config.mjs`, `postcss.config.mjs`, `next.config.ts` | Stock scaffolding (eslint also ignores `backup/**`), except `next.config.ts`: `devIndicators: false` (no "N" badge in `next dev`), `images.remotePatterns` for the photo bucket and `headers()` with three basic security headers (no CSP — it would break the map's tiles and Nominatim) |
| `public/` | Default create-next-app SVGs; unused by the design |
