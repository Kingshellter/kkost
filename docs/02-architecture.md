# 02 · Architecture

## Page composition

Two routes: `/` and `/kos/[id]`.

[`src/app/page.tsx`](../src/app/page.tsx) is an async Server Component. It
loads the kos list, the session and `searchParams` in parallel, derives the
filtered list, fetches the featured kos's reviews for the hero, and stacks seven
sections inside a `<main>`:

```
RootLayout (app/layout.tsx)  — html lang="id", Jakarta font, bg-cream
└── page.tsx
    ├── <Navbar/>                       server
    └── <main>
        ├── <Hero/>          #(top)     server  ← all kos: live stats, featured kos
        ├── <Impact/>        #dampak    server  ← problem statement + SDGs
        ├── <Scoring/>       #scoring   server
        ├── <Trust/>         #trust     server
        ├── <MapSection/>    #reviews   server  ← filtered kos; hosts the client island
        ├── <Browse/>        #browse    server  ← filtered kos + filter form
        └── <Cta/>           #login     server
```

## The URL filter

Filtering is a server render, not client state:

```
hero form or browse form  (plain <form action="/#browse">, GET)
  → /?kota=Surakarta&harga=1000000&urut=harga#browse
  → page.tsx: await props.searchParams
       · parseKosFilter(params)   zod with .catch — bad input means "no filter"
       · applyKosFilter(all, f)   in memory: city (id-ID, case-insensitive),
                                  price ≤ budget, sort by skor / harga / jarak
  → <MapSection kos={filtered} narrowed/>  map pins + sidebar
  → <Browse kos={filtered} total={all.length}/>  grid, count, reset link
  → <Hero stats={summarizeKos(all)}/>  unaffected by the filter
```

It works with JavaScript off, survives a refresh, and a result can be shared
as a link. Filtering happens after the fetch because the hero's numbers and the
city dropdown need the unfiltered list anyway; move it into the query only when
the list is large enough for that to matter.

Within `/`, anchor ids are the navigation, and every entry in `NAV_LINKS` now
resolves — the old "For owners" link pointed at `#owners`, which no section
defined, and was replaced by "Kenapa terpercaya" → `#trust`. Kos cards and the map
sidebar link out to `/kos/[id]`.

## Server / client boundary

Almost everything is a Server Component. These files carry `"use client"`:

| File | Why it must be a client component |
|---|---|
| `components/map/map-frame.tsx` | Holds the `dynamic(..., { ssr: false })` import |
| `components/map/kos-map.tsx` | Leaflet, `useState`, map event handlers |
| `components/map/map-search.tsx` | Debounced fetch, input state, keyboard handlers |
| `components/map/kos-sidebar.tsx` | Subscribes to the zustand store |
| `components/map/add-kos-dialog.tsx` | react-hook-form, `useEffect`, DOM writes |
| `components/auth/auth-card.tsx` | `useActionState`, sign-in/sign-up tab state |
| `components/review/review-form.tsx` | `useActionState`, radio-group state |
| `components/sections/mobile-nav.tsx` | Disclosure state for the mobile menu |
| `store/kos-store.ts` | zustand |

The repositories in `lib/` are **not** client modules any more. Every function
takes the Supabase client as an argument, so the same query runs server-side
(`utils/supabase/server`) and in the browser (`utils/supabase/client`).

### Why the map is dynamically imported

Leaflet touches `window` at **import time**, so it cannot be evaluated during
SSR. `MapFrame` exists for one reason: to be the client boundary that holds

```ts
const KosMap = dynamic(() => import("./kos-map"), { ssr: false, loading: ... });
```

`MapSection` (a Server Component) renders `<MapFrame/>` inside a fixed-height,
rounded, overflow-hidden container. **Do not** move the dynamic import up into
`MapSection` — `ssr: false` is not allowed from a Server Component.

## The "add a kos" flow

Trace it end to end:

`signedIn` is read once in `page.tsx` and threaded down
(`MapSection` → `MapFrame` → `KosMap`).

```
user clicks map
  → ClickCatcher (useMapEvents) → setDraft([lat, lng])
  → red "+" draft marker + Popup
       signed out → "Masuk dulu untuk menambah kos" + link to #login. Stops here.
       signed in  → "Tambahkan kos di titik ini?"
  → user clicks "+ Tambah kos" → setFormAt(draft)
  → <AddKosDialog position={formAt}/>
       · zod validates name / area / city / campus (optional) / price / distance
       · submit → saveKos(browserClient, input)  [lib/kos-repository.ts]
            ├─ no env vars   → { status: "unconfigured" }
            ├─ insert ok     → { status: "saved", id }
            └─ postgrest err → { status: "error", message }  ← shown inline, dialog stays open
  → onSaved(input, result)  [kos-map.tsx handleSaved]
       · addKos(toKos(input, savedId))   → zustand store
         (real uuid when saved, `local-…` when unconfigured)
       · saved → router.refresh(); mergeKos drops the optimistic copy
         once the server list carries the same id
       · close dialog + clear draft
       · toast notice for 6s (wording differs for "saved" vs "unconfigured")
  → new pin renders (dark "Baru" badge, because reviews === 0)
    and the sidebar count/list updates from the same store
```

The gate is UI convenience, not the boundary: the `kos` INSERT policy is
`to authenticated`, so an unauthenticated write is rejected by Postgres even if
the dialog is forced open.

Key point: **the local map update is not conditional on the database write
succeeding.** An `unconfigured` result still adds the pin; only a hard `error`
aborts. That is deliberate — the demo has to work without a database.

## State

The server-rendered kos list flows down as **props**: `page.tsx` → `MapSection`
→ `MapFrame`/`KosSidebar`.

The zustand store, [`src/store/kos-store.ts`](../src/store/kos-store.ts), holds
**only what the user added by clicking the map** this session:

```ts
{ added: Kos[], addKos: (kos: Kos) => void }
```

`KosMap` and `KosSidebar` each merge through `mergeKos(added, fromServer)`,
which drops an added kos the server list already carries — without that, a
saved kos renders twice after `router.refresh()`. The store
exists because those two are siblings under a Server Component parent, so props
cannot be threaded between them. It is session-only — a refresh drops anything
not persisted to Supabase.

> An earlier version seeded the whole list into the store from a hydrator
> component. That needed a `useRef` guard read during render, which the React
> lint rules reject. Props + a merge is simpler and has no hydration flash.

Everything else is either static module data or local `useState`.

## The map's viewport

kkost covers the whole country, so there is no sensible fixed centre.
`MapContainer` starts at `INDONESIA` (centre `[-2.5, 118]`, zoom 5) and
`FitToKos` immediately fits the view to the kos that actually exist — one city
of data zooms to that city, and the view widens on its own as other cities
appear.

Two things that flow needs, both learned the hard way:

- **The container is sized late.** On first mount it can measure ~206px wide;
  fitting against that lands several zoom levels too far out. A `ResizeObserver`
  re-fits as the real width arrives.
- **The padding must scale with the container.** A fixed 56px inset either side
  is fine on a desktop but is over half the width of a phone-sized map, which
  pushes the fit way out. It is `min(56, 8% of width, 8% of height)`.

The fit stops as soon as the user touches the map — `pointerdown` and `wheel`,
which only ever come from a person, unlike Leaflet's own `zoomstart`.

## Searching for a street or place

The map's search box finds locations, not kos — a street, a neighbourhood, a
campus, a landmark — so a user can get to the part of the country they care
about before browsing or adding anything.

```
user types ≥3 characters
  → MapSearch debounces 450ms, aborting the previous request
  → searchPlaces(query)  [lib/geocode.ts]  → Nominatim, results capped to Indonesia
       ok      → up to 6 Place rows in a listbox
       error   → the message inline in the same panel, in Indonesian
       none    → "Tidak ada tempat yang cocok."
  → user clicks a row, or presses Enter for the best match
  → onPick → KosMap.handlePlacePick
       · setPlace  → blue place pin + <FocusPlace/> flies the view there
       · setSearchTookOver(true)
       · clears any add-kos draft, whose popup belongs to a point being left
```

Three things that flow needs:

- **`FocusPlace` frames the bounding box, not the point.** A street is a line
  and a district is an area; `flyTo` at zoom 17 is only the fallback for a
  result Nominatim returns without a box. Padding comes from the same
  `fitPadding` helper `FitToKos` uses.
- **`searchTookOver` is a one-way latch, not `!place`.** Without it, the
  `ResizeObserver` in `FitToKos` would fire after the fly and yank the view
  back to the kos. And because it never resets, clearing the search box removes
  the pin but leaves the view where the user put it.
- **The search box lives outside `MapContainer`.** Rendered as a Leaflet child,
  every click and keystroke in it would also drag the map, zoom it, or open the
  add-kos draft. It is a sibling overlay at `z-[500]` instead, sharing a
  top-left column with the "klik peta" hint so the two cannot overlap on a
  phone. Leaflet's own zoom control moved to `bottomright` to make room.

Nominatim is keyless, like the tiles, so search survives a checkout with no
environment variables. Its usage policy caps callers at roughly one request a
second, which is the debounce's real reason.

## Supabase clients — three of them, do not mix

| File | Factory | Use from |
|---|---|---|
| `utils/supabase/client.ts` | `createBrowserClient` | Client Components / browser code |
| `utils/supabase/server.ts` | `createServerClient` + `cookies()` | Server Components, Route Handlers, Server Actions. `setAll` is wrapped in try/catch because Server Components cannot write cookies — `proxy.ts` handles the refresh instead. |
| `proxy.ts` | `createServerClient` + request/response cookies | Runs on every non-asset request; calls `supabase.auth.getUser()` to refresh the session |

`src/proxy.ts` **bails out early** when the env vars are missing, so public
pages keep rendering on a bare checkout. Its matcher excludes `_next/static`,
`_next/image`, `favicon.ico`, and common image extensions.

> The file is named `proxy.ts`, not `middleware.ts` — Next.js 16 deprecated the
> `middleware` convention and warns on every build. The exported function must
> be named `proxy` (or be the default export).

## Auth

Email + password through Supabase Auth, driven by **Server Actions** in
[`src/lib/auth-actions.ts`](../src/lib/auth-actions.ts) (`signIn`, `signUp`,
`signOut`). The UI is [`components/auth/auth-card.tsx`](../src/components/auth/auth-card.tsx),
a `useActionState` form rendered by the CTA section.

- `getSessionUser()` in [`src/lib/auth.ts`](../src/lib/auth.ts) is the only way
  to read the current user. Call it from Server Components. **Never** take a
  user id from the client.
- A `.ac.id` address sets `profiles.is_student` — the "penghuni terverifikasi"
  badge. The flag is computed by a database trigger on sign-up, not by the app,
  and 0006 leaves the user no UPDATE privilege on it.
- A `"use server"` module may only export **async functions**. The
  `useActionState` initial objects therefore live in
  [`src/lib/action-state.ts`](../src/lib/action-state.ts), not next to the
  actions. Exporting a plain object from an actions file fails the build.

## The "write a review" flow

```
/kos/[id] (server)
  → getSessionUser()             not signed in → prompt to sign in
  → fetchReviews(supabase, id)   already reviewed (matched on authorId) → tell the user
  → <ReviewForm kosId>           six radio groups, 1–5, + optional note
       submit → submitReview (server action)
            · re-reads the user from the session — the form never sends an author id
            · zod validates the six scores and the note
            · saveReview → insert into public.reviews
                 23505 → "sudah menulis review untuk kos ini"
                 42P01 → migration 0002 not applied
                 42501 → RLS rejected (not signed in)
            · revalidatePath("/kos/[id]") and revalidatePath("/")
  → the database trigger recomputes kos.score and kos.reviews
```

The score is never written by the application. `kos.score` and `kos.reviews`
are derived columns maintained by `refresh_kos_score()` — see
[03-data-model.md](03-data-model.md).
