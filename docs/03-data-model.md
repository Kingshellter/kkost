# 03 · Data model

## The `Kos` type — the app's central shape

Defined in [`src/data/kos.ts`](../src/data/kos.ts). Every card, pin, and list
row consumes this:

```ts
type Kos = {
  id: string;
  name: string;
  area: string;          // neighbourhood, e.g. "Tembalang"
  city: string;          // city or regency, e.g. "Semarang"
  campus: string | null; // the campus `distance` is measured against, if any
  distance: number | null; // walking distance to `campus`, in METRES; null for kos added via the form
  price: number;         // rupiah per month, plain integer (950_000)
  score: number;         // 0–5, one decimal
  reviews: number;       // count; 0 means "Baru" (new) everywhere in the UI
  photoAccent: Accent;   // picks the KosPhoto illustration + tint (kos have no photos)
  coords: [number, number];   // [lat, lng] — Leaflet order, not GeoJSON order
  highlights: FacilityScore[];
};

type FacilityScore = { label: string; score: number; accent: Accent };
type Accent = "rose" | "amber" | "blue" | "sky" | "ink";
```

## The six facilities, and `Review`

```ts
const FACILITY_KEYS = ["room","bathroom","water","wifi","kitchen","parking"];
type FacilityKey = (typeof FACILITY_KEYS)[number];

type Review = {
  id: string;
  kosId: string;
  authorId: string;                      // profiles.id — identity checks use this, never authorName
  authorName: string;
  isStudent: boolean;                    // signed up with a .ac.id address
  isDemo: boolean;                       // written by a seeded demo account — always labelled
  scores: Record<FacilityKey, number>;   // each 1–5
  average: number;                       // mean of the six, computed by the DB
  body: string | null;
  photos: string[];      // public URLs, oldest first, ≤ 3 (0010); [] before 0010
  createdAt: string;
};
```

`FACILITY_KEYS` are **also the column names** in `public.reviews`, and each
entry in `CRITERIA` carries the matching `key`. One list of six strings drives
the form fields, the zod schema, the insert payload, and the display order.

Three conventions worth burning in:

- **`distance` is metres, and usually null.** kkost is nationwide, so there
  is no single origin to compute it from, and the add-kos form stopped asking
  for it (19 Sep 2026) — only seeded kos carry one. Render the campus line with
  `formatCampus(campus, distance)`: `700 m ke UGM` when known, `Dekat UGM` when
  not, nothing without a campus. "Terdekat ke kampus" sorts null last.
- **`coords` is `[lat, lng]`**, matching Leaflet. Do not swap to `[lng, lat]`.
- **`city` is the unit of geography**, not the campus. A kos with no nearby
  campus is still a valid kos.

`reviews === 0` is the "new kos" sentinel. It drives the dark `Baru` badge in
`KosSidebar` and the dark pin in `KosMap`. Do not invent a separate `isNew` flag.

## Other exports from `src/data/kos.ts`

| Export | What it is |
|---|---|
| `INDONESIA` | `{ center: [-2.5, 118], zoom: 5 }` — the map's fallback view when there is nothing to fit to |
| `KOS_LIST` | 4 demo kos with **invented** scores — shown only when Supabase is not configured, never on a database error (see [Reads](#reads)) |
| `CRITERIA` | The six scoring criteria (`key`, number, title, description, accent). `number` is no longer shown on `/` — `HowItWorks` pairs each `key` with a lucide icon instead. `description` is a 3–5 word hint shown under the title in "Cara kerja"; keep it that short |
| `NAV_LINKS` | Navbar anchors, in page order, rooted at `/` (`/#peta`, not `#peta`): Cara kerja, Peta, Cari kos so they work from `/kos/[id]` too. `as const` — `SectionLink` requires the `/#…` literal type |

`INDONESIA`, `CRITERIA` and `NAV_LINKS` are static copy, all in Indonesian. `KOS_LIST` exists only
for a checkout without credentials — the real list comes from Supabase.

The hero's headline numbers are **not** static: `summarizeKos` in
[`src/lib/kos-browse.ts`](../src/lib/kos-browse.ts) counts them from the loaded
list. They used to be a hardcoded `STATS` object claiming 11,907 reviews on a
database with none — do not reintroduce a typed-in statistic.

## Supabase table: `public.kos`

The live table originally shipped with only `id`, `name`, `created_at`.
Everything else comes from
[`supabase/migrations/0001_kos_location_fields.sql`](../supabase/migrations/0001_kos_location_fields.sql),
which must be pasted into the **Supabase Dashboard → SQL Editor** by hand —
there is no migration runner wired up.

| Column | Type | Notes |
|---|---|---|
| `id` | **uuid** | the app always handles it as `string` |
| `name` | text | |
| `created_at` | timestamptz | |
| `area` | text | nullable — neighbourhood |
| `city` | text | nullable — from 0003 |
| `campus` | text | nullable — from 0003 |
| `price` | integer | nullable |
| `distance_m` | integer | nullable — **note the `_m` suffix**. Metres to `campus`. Set on seeded rows only; `toKosRow` no longer writes it |
| `lat` | double precision | nullable |
| `lng` | double precision | nullable |
| `score` | numeric(2,1) | `not null default 0` |
| `reviews` | integer | `not null default 0` |
| `created_by` | uuid | nullable — from 0008. → `profiles(id)`, `on delete set null`. `default auth.uid()`; **not writable by any client role**, so it always names the session that inserted the row. NULL on seed and legacy rows |

Plus a `kos_lat_lng_valid` check constraint (both null, or lat ∈ [-90,90] and
lng ∈ [-180,180]), a `kos_lat_lng_idx` index on `(lat, lng)`, and a
`kos_city_idx` index on `(city)`.

**Content limits — 0008.** Before 0008 the only validation lived in the zod
schema of `AddKosDialog`, which a direct REST call skips. Now the database
enforces it:

| Constraint | Rule |
|---|---|
| `kos_name_length` | `name` 3–120 chars |
| `kos_area_length` | `area` 2–120 chars |
| `kos_city_length` | `city` 2–80 chars (the URL filter also caps `kota` at 80) |
| `kos_campus_length` | `campus` 2–120 chars |
| `kos_price_range` | `price` 1–100,000,000 |
| `kos_distance_range` | `distance_m` 0–50,000 |
| `kos_in_indonesia` | both null, or lat ∈ [-11.5, 6.5] and lng ∈ [94, 141.5] |

NULL passes a CHECK, so legacy nullable rows are unaffected. The zod schema in
`add-kos-dialog.tsx` mirrors these numbers — **change both together**.

The new columns are deliberately **nullable** so the migration does not fail on
pre-existing rows. The SQL file carries a commented-out `set not null` block to
run once legacy rows are backfilled.

## The column-name boundary

**One repository per table**, and it is the only module that names that table's
columns:

| Table | Repository |
|---|---|
| `public.kos` | [`src/lib/kos-repository.ts`](../src/lib/kos-repository.ts) |
| `public.reviews` + `public.profiles` | [`src/lib/review-repository.ts`](../src/lib/review-repository.ts) |

Every function takes the Supabase client as its first argument, so the same
query runs from a Server Component and from the browser.

`toKosRow()` is the single mapping from app shape to DB shape, and it is where
the one name mismatch lives:

```
app `distance`  ⇄  column `distance_m`
```

If you add a column, extend `toKosRow` — do not scatter `.from("kos")` calls
with inline object literals through components.

## Error handling contract

`saveKos` never throws. It returns a discriminated union:

```ts
type SaveResult =
  | { status: "saved"; id: string }
  | { status: "unconfigured" }
  | { status: "error"; message: string };
```

The private `explain()` helper translates the two failures actually expected
into Indonesian, actionable text:

| Condition | Message |
|---|---|
| `PGRST204` / `column ... of 'kos'` | "Kolom belum ada di tabel kos. Jalankan migrasi di supabase/migrations/ secara berurutan lewat SQL Editor." |
| `23514` on `kos_in_indonesia` | "Titik ini di luar Indonesia. …" |
| `23514` on any other check (0008) | "Data kos di luar batas yang diizinkan. …" |
| `42501` / `row-level security` | "Ditolak: menambah kos harus masuk dulu." |
| anything else | the raw PostgREST message |

**RLS:** inserts need a session (`kos_insert_authenticated`, 0004). `42501` is
also what Postgres returns when an insert names a column the role holds no
privilege on — after 0006, sending `score` or `reviews` fails that way. Fix a
42501 with a policy or a column grant, never by disabling RLS.

## Reads

`fetchKosList(supabase)` and `fetchKos(supabase, id)` map rows back to `Kos`:

- `distance_m` → `distance`
- `lat`/`lng` → `coords: [lat, lng]`
- `photoAccent` — not stored; `photoAccentFor(id)` hashes the id into
  `["amber","sky","rose","blue"]`. By id, not list position, so a kos gets the
  same illustration on its card, in the hero and on its detail page (fetched alone)
- `highlights` — not stored; the detail page computes per-facility averages from
  the review rows instead

Two behaviours worth knowing:

- **`KOS_LIST` appears only when Supabase is not configured.** `fetchKosList`
  returns `{ kos, source }` where `source` is `"demo"` (no credentials →
  `KOS_LIST`), `"database"` (the real rows — an empty table stays empty), or
  `"unavailable"` (query failed → **empty list**). The landing page renders a
  notice for the last two non-database states. `fetchKos` resolves demo slugs
  only without credentials; with credentials a non-uuid id (`22P02`) is a 404
  and any other error **throws**. The demo kos carry invented scores, so
  falling back to them during an outage would pass fake numbers off as tenant
  reviews — which is exactly what an earlier version did.
- **Rows with a null `lat`/`lng` are filtered out.** Legacy rows predate the
  location migration; without this they would all pile up at [0, 0].

## `public.reviews` — from 0002_reviews.sql

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | `default gen_random_uuid()` |
| `kos_id` | uuid | → `kos(id)`, cascade delete |
| `author_id` | uuid | → `profiles(id)`, cascade delete |
| `room` `bathroom` `water` `wifi` `kitchen` `parking` | smallint | each `check between 1 and 5` |
| `average` | numeric(2,1) | **generated column** — mean of the six, rounded to 1dp. Never written by the app |
| `body` | text | optional, ≤ 2000 chars |
| `created_at` / `updated_at` | timestamptz | `updated_at` maintained by a trigger |

`unique (kos_id, author_id)` enforces "one review per kos, per tenancy" — a
duplicate insert comes back as PostgREST code `23505`.

The column names are exactly `FACILITY_KEYS` from `src/data/kos.ts`. That is
deliberate: the form field names, the zod schema, and the insert payload all use
the same six strings, so they cannot drift.

## `public.profiles`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | → `auth.users(id)` |
| `display_name` | text | from sign-up metadata, else the email local part |
| `is_demo` | boolean | `not null default false`, from 0007. Marks the seeded demo accounts; not writable by any client role |
| `is_student` | boolean | true when the address ends in `.ac.id` (case-insensitive since 0006). **Not writable by the user** — 0006 grants UPDATE on `display_name` only |
| `created_at` | timestamptz | |

`auth.users` is not readable from the client, so the public identity of a review
author lives here. Rows are created by the `on_auth_user_created` trigger — the
app never inserts a profile.

## `public.review_photos` and the `review-photos` bucket — from 0010_review_photos.sql

Photos are **evidence attached to one review**, not pictures of the kos.
0009 had made them belong to the kos (anyone signed in could attach one to
any kos, shown as its banner); 0010 drops `kos_photos` and its upload policy.
The old `kos-photos` bucket was then deleted by hand from the dashboard
(19 Sep 2026) — Supabase forbids deleting Storage rows from SQL.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | `default gen_random_uuid()` |
| `review_id` | uuid | → `reviews(id)`, cascade delete |
| `path` | text | unique. Object name, `<review_id>/<uuid>.<ext>`. CHECK `review_photos_path_in_review_folder`: must start with its own `review_id/`, ≤ 200 chars |
| `uploaded_by` | uuid | → `profiles(id)`. `default auth.uid()`, **not client-writable** |
| `created_at` | timestamptz | photos display oldest first |

Repository: [`src/lib/review-photo-repository.ts`](../src/lib/review-photo-repository.ts)
— `REVIEW_PHOTO_BUCKET`, the limits, `checkPhotoFile`, `uploadReviewPhotos`,
and `photoUrls`. `fetchReviews` embeds `review_photos ( path, created_at )`
and falls back to the older selects when the table is missing.

How a photo is protected, layer by layer:

- **Bucket** `review-photos`: public read, `file_size_limit` 2 MB,
  `allowed_mime_types` jpeg/png/webp — enforced by Storage, mirrored by
  `checkPhotoFile` for an earlier error.
- **Storage policy** `review_photos_upload`: INSERT for `authenticated` only,
  and the first folder must be the id of a review **the uploader wrote**. No
  SELECT, UPDATE or DELETE policy — public URLs need no SELECT (one would let
  anyone list the bucket), and nobody can overwrite or delete a photo.
- **Table**: RLS select anyone; insert `authenticated` with
  `auth.uid() = uploaded_by` **and** the review's `author_id = auth.uid()`;
  column grant INSERT `(review_id, path)` only; no UPDATE/DELETE grant.
- **Trigger** `review_photos_check` → `check_review_photo()` (SECURITY
  DEFINER, EXECUTE revoked): locks the review row, rejects (`23514`) a fourth
  photo, and rejects a row unless `storage.objects` holds that path in that
  bucket with `owner_id = uploaded_by`.

Each upload is two steps — object, then row. A failed row leaves an orphaned
object that is never displayed.

## Derived scores — never write these

`kos.score` and `kos.reviews` are **derived**. The `refresh_kos_score()` trigger
recomputes both after every insert, update, or delete on `reviews`:

```
kos.score   = round(avg(reviews.average), 1)
kos.reviews = count(reviews)
```

The application must never assign them, and since 0006 it cannot: neither
`anon` nor `authenticated` holds a privilege on those two columns, so even a
hand-written REST insert is rejected. The trigger recomputes **both**
`old.kos_id` and `new.kos_id`, so a review moved between kos (possible only from
the dashboard or service role) leaves neither score stale.

If a score looks wrong, the bug is in the trigger or in the review rows, not in
the client.

## Row Level Security

Enabled on `kos`, `profiles`, `reviews`, and (after 0010) `review_photos`.

| Table | Policy |
|---|---|
| `kos` | select: anyone. insert: **authenticated only**, and since 0008 `auth.uid() = created_by` (0004 replaced 0002's open policy) |
| `profiles` | select: anyone. update: own row only |
| `reviews` | select: anyone. insert: authenticated, `auth.uid() = author_id`. update: own row **and** `created_at > now() - 30 days`. delete: own row only |

The line is **writes need an identity, reads never do**. Anyone can browse the
map, the listings, the detail pages and every review without an account; only
contributing requires one. That split is the submission's answer to the
competition theme, so keep it when adding tables: `select using (true)`, writes
`to authenticated`.

### Column privileges — 0006

RLS decides **which rows** a role may write, not **which columns**. Supabase
grants `anon` and `authenticated` INSERT/UPDATE on every column by default, so
before 0006 "update your own profile" also meant "set your own `is_student`".
0006 revokes the table-level privileges and grants back only what a user types:

| Table | INSERT (authenticated) | UPDATE (authenticated) |
|---|---|---|
| `kos` | `name, area, city, campus, price, distance_m, lat, lng` | none |
| `profiles` | none — the trigger creates rows | `display_name` |
| `reviews` | `kos_id, author_id`, the six scores, `body` | the six scores, `body` |

`kos.created_by` (0008) is deliberately absent from the INSERT list, so its
`auth.uid()` default is the only way it gets a value.

`anon` holds neither. `created_at` on `reviews` is not updatable, which is what
makes the 30-day window real. Supabase's linter does not check this — query
`information_schema.column_privileges` after adding a table or column.

There is deliberately **no policy that lets a kos owner delete a review**. That
is the product's core promise, enforced in the database rather than in the UI.

## Seed data

[`supabase/seed.sql`](../supabase/seed.sql) backfills the three legacy rows and
inserts kos across Jakarta, Bandung, Surabaya, Sleman, Malang, Semarang and
Surakarta, so the map shows a national spread. Rows are matched by `name`, so
re-running only updates. Run it after all three migrations.

## Demo reviews

[`supabase/seed_demo_reviews.sql`](../supabase/seed_demo_reviews.sql) inserts
four accounts straight into `auth.users` and 17 reviews across eight kos,
leaving three kos unreviewed so the "Baru" state is visible too.

A demo review that looks like a tenant's is a fake review, so the honesty is
structural rather than a promise:

- the accounts are flagged `profiles.is_demo`, which no client role can write;
- their emails end in `.invalid` (reserved by RFC 2606), so none can earn the
  "mahasiswa terverifikasi" badge;
- `encrypted_password` is empty, so nobody can sign in as them;
- `Review.isDemo` drives a "Review contoh" badge on every card, a count in the
  `ScoreProvenance` panel, and a "review contoh" caption on the hero quote.

Their scores still flow through `refresh_kos_score()` like any other review.
The token columns are set to `''` rather than NULL because Supabase Auth fails
to list users whose token columns are NULL.

`fetchReviews` asks for `profiles.is_demo` and, if that select errors (0007 not
run yet), retries without it — reviews lose their label instead of vanishing.

## Running migrations — a manual step

There is no migration runner. Paste each file into the **Supabase Dashboard →
SQL Editor**, in order:

1. `supabase/migrations/0001_kos_location_fields.sql`
2. `supabase/migrations/0002_reviews.sql`
3. `supabase/migrations/0003_city_and_campus.sql`
4. `supabase/migrations/0004_kos_insert_requires_login.sql`
5. `supabase/migrations/0005_linter_fixes.sql`
6. `supabase/migrations/0006_column_grants.sql`
7. `supabase/migrations/0007_demo_profiles.sql`
8. `supabase/migrations/0008_kos_constraints.sql`
9. `supabase/migrations/0009_kos_photos.sql` — applied live 19 Sep 2026;
   superseded by 0010, which drops its table
10. `supabase/migrations/0010_review_photos.sql` — applied live 19 Sep 2026.
    The app still runs without it: `fetchReviews` retries without the embed
11. `supabase/seed.sql`
12. `supabase/seed_demo_reviews.sql` — optional, but the demo is empty without it

An agent cannot do this — the Supabase connector is read-only. Write the
migration, then ask the user to run it, then verify with `list_tables`.

**After any schema change, run Supabase's own database linter** (`get_advisors`,
both `security` and `performance`). It catches what review misses: 0005 exists
entirely because of what it found. On a submission judged on trustworthiness, a
clean linter report is evidence.
