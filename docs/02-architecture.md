# 02 · Architecture

## Page composition

Two routes: `/` and `/kos/[id]`.

[`src/app/page.tsx`](../src/app/page.tsx) is an async Server Component. It
fetches the kos list once and passes it down as props, then stacks five
sections inside a `<main>`:

```
RootLayout (app/layout.tsx)  — html lang="id", Jakarta font, bg-cream
└── page.tsx
    ├── <Navbar/>                       server
    └── <main>
        ├── <Hero/>          #(top)     server
        ├── <Scoring/>       #scoring   server
        ├── <Trust/>         #trust     server
        ├── <MapSection/>    #reviews   server  ← hosts the client island
        ├── <TopRated/>      #browse    server
        └── <Cta/>           #login     server
```

Within `/`, anchor ids are the navigation, and every entry in `NAV_LINKS` now
resolves — the old "For owners" link pointed at `#owners`, which no section
defined, and was replaced by "Why trust this" → `#trust`. Kos cards and the map
sidebar link out to `/kos/[id]`.

## Server / client boundary

Almost everything is a Server Component. These files carry `"use client"`:

| File | Why it must be a client component |
|---|---|
| `components/map/map-frame.tsx` | Holds the `dynamic(..., { ssr: false })` import |
| `components/map/kos-map.tsx` | Leaflet, `useState`, map event handlers |
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
       · addKos(toKos(input, index))   → zustand store
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

`KosMap` and `KosSidebar` each merge `[...added, ...fromServer]`. The store
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
  badge. The flag is computed by a database trigger on sign-up, not by the app.
- A `"use server"` module may only export **async functions**. The
  `useActionState` initial objects therefore live in
  [`src/lib/action-state.ts`](../src/lib/action-state.ts), not next to the
  actions. Exporting a plain object from an actions file fails the build.

## The "write a review" flow

```
/kos/[id] (server)
  → getSessionUser()             not signed in → prompt to sign in
  → fetchReviews(supabase, id)   already reviewed → tell the user
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
