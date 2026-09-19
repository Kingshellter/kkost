# kkost — Documentation Index

**Read this folder instead of scanning `src/`.** It is written to be the single
entry point for any agent or new contributor. If a file in `src/` contradicts
something here, the code wins — and this folder must be updated (see
[07-maintaining-these-docs.md](07-maintaining-these-docs.md)).

## Reading order

| # | File | Read it when you need to know… |
|---|------|-------------------------------|
| 1 | [01-overview.md](01-overview.md) | What the product is, what stack it uses, what actually works today |
| 2 | [02-architecture.md](02-architecture.md) | How a request flows, where the server/client boundary sits, why the map is dynamic |
| 3 | [03-data-model.md](03-data-model.md) | The `Kos` type, the Supabase tables, the migrations that must be run by hand |
| 4 | [04-design-system.md](04-design-system.md) | Colours, radii, shadows, the accent system, the shared UI primitives |
| 5 | [05-file-map.md](05-file-map.md) | Which file owns what — one line per file in `src/` |
| 6 | [06-conventions.md](06-conventions.md) | The rules to follow when writing code in this repo |
| 7 | [07-maintaining-these-docs.md](07-maintaining-these-docs.md) | What to update here after you change code |
| 8 | [08-roadmap.md](08-roadmap.md) | **What to do next, in order** — the hand-off list (in Indonesian), ranked by the competition's judging weights. Start here if you are picking the project up |

## 30-second version

kkost is a Next.js 16 site for reviewing kos (student boarding houses)
**anywhere in Indonesia**. Students rate six facilities 1–5; the plain average
is the kos score.

Two routes: `/` (five sections plus an interactive Leaflet map where clicking
anywhere opens a form to add a kos) and `/kos/[id]` (per-facility averages, the
review list, and the review form). Every kos carries its own city and, if
someone supplied one, the campus its walking distance is measured against —
there is no single national reference point. Auth is Supabase email + password;
a `.ac.id`
address marks a reviewer as a verified tenant. Scores are recomputed by a
database trigger, never written by the app. Everything degrades gracefully when
Supabase env vars are missing or the migrations have not been run.

**The migrations are applied by hand** in the Supabase SQL Editor — see
[03-data-model.md](03-data-model.md#running-migrations--a-manual-step).

## Commands

```bash
npm run dev     # next dev
npm run build   # next build
npm run start   # next start
npm run lint    # eslint
```
