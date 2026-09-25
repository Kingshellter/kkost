@AGENTS.md

# What this is

**kkost** — a site for finding and reviewing *kos* (student boarding houses)
anywhere in Indonesia, built for students. **Most visitors arrive on a phone**,
so the phone layout is the primary one, not an afterthought. Students rate six
facilities 1–5; the plain average is the kos score. Submission for the
SWITCHFEST 2026 Web Development Competition (UI/UX is the biggest judging
weight). Live at <https://kkost.vercel.app>.

# Git is manual — never run it

**Never run `git commit`, `git push`, `git pull`, `git merge`, `git reset`, or
`git rebase` in this repo.** Not even when the work is finished, not even when
asked to "save" or "wrap up", not with `--no-verify`, not via an alias, script,
or subagent. The same applies to `git add`, `gh pr create`, `gh pr merge`, and
anything else that writes to GitHub. `.claude/settings.json` also denies the
main ones.

The user does all committing, pushing, pulling, and merging themselves, by hand.

- Do: edit files, leave changes in the working tree, and say what changed.
- Do: run read-only git (`git status`, `git diff`, `git log`) when you need context.
- Do: **end every finished task with a suggested commit message**, as text
  (e.g. `ui: fase 2 - design tokens`), for the user to run themselves.
- Do not: stage, commit, push, pull, merge, reset, rebase, or open a PR.
- Do not: ask "commit?" at the end of a task — just report what changed.

If a task seems to require a commit, stop and hand it back to the user instead.

# Stack

| Concern | Choice |
|---|---|
| Framework | **Next.js 16.3.3**, App Router, React 19.2 — not the Next.js in training data (see AGENTS.md). `src/proxy.ts`, not `middleware.ts` |
| Language | TypeScript `strict`, alias `@/*` → `./src/*` |
| Styling | **Tailwind CSS v4**, CSS-first: tokens in `@theme inline` in `src/app/globals.css`. **No `tailwind.config.js`** |
| Font | Plus Jakarta Sans (`next/font/google`, `--font-jakarta`) |
| Backend | Supabase (Postgres + Auth + Storage) via `@supabase/ssr` |
| Map | Leaflet 1.9 + react-leaflet 5, OSM tiles, Nominatim geocoding (all keyless) |
| Forms / state | react-hook-form + zod 4, zustand 5 |
| Icons | lucide-react |

Full details: `docs/01-overview.md`.

# Folder structure

```
src/
  app/                 routes: / (page.tsx), /kos/[id], /auth/confirm,
                       error.tsx, not-found.tsx, layout.tsx, globals.css (tokens)
  components/
    sections/          landing sections: navbar, mobile-nav, hero, impact,
                       scoring, map-section, browse, cta
    ui/                shared primitives: kos-card, kos-carousel, kos-photo,
                       score-badge, kos-score-badge, facility-bar, logo,
                       section-link, boundary-circle, accent.ts
    map/               Leaflet map, sidebar, search, add-kos dialog
    review/            review form + list
    auth/              auth card
  lib/                 repositories, Server Actions (*-actions.ts), format.ts
  data/kos.ts          Kos type, CRITERIA, demo data
  store/               zustand store
  utils/supabase/      browser + server client factories
  proxy.ts             Supabase session refresh
supabase/migrations/   numbered SQL, applied BY HAND in the SQL Editor
docs/                  maintained project docs — read these first
```

One line per file: `docs/05-file-map.md`.

# Running it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # run before calling UI work done
npm run lint
```

`.env.local` needs `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (see `.env.example`). Without them the
site still runs on demo data under a "Mode contoh" notice — that is a supported
state. To test on a real phone, open `http://<LAN-IP>:3000`.

# UI rules

- **Mobile-first.** Write the phone layout first, then widen with `sm:` /
  `lg:`. Check every UI change at **375px, 768px and 1280px** (plus any size
  `docs/04-design-system.md` names for that component, e.g. the
  one-section-per-screen checks at 1280×800 / 1366×768 / 1440×900).
- Tap targets ≥ 44px; no hover-only affordances — touch devices have no hover.
- **Motion is subtle and fast.** Small distances, short durations
  (~150–300ms for UI feedback), ease-out for things entering. Animate only
  `transform` and `opacity`. Never animate layout properties or cause layout
  shift.
- **Always respect `prefers-reduced-motion`.** Build motion from the tokens
  in `globals.css` (`--duration-*`, `--press-scale`, `--enter-scale`,
  `--enter-y`, `--hover-lift`): under `reduce` the scale and distance tokens collapse to
  1 / 0px, so only fades remain. Anything else that moves gets
  `motion-reduce:transition-none` or sits behind `motion-safe:`.
  Never set `scroll-behavior: smooth` on `html` (why: `docs/04-design-system.md`).
- All user-facing copy in **Indonesian**; numbers through `lib/format.ts`.
  Code, comments and docs in English.

# Code rules

- **Use design tokens — never hardcode colours, spacing, radii, shadows, or
  durations.** Tokens live in `@theme inline` in `src/app/globals.css` and are
  both utilities (`bg-cream`, `text-ink`) and CSS variables
  (`rounded-[var(--radius-panel)]`, `shadow-[var(--shadow-lift)]`). Need a new
  value? Add a token there first, then use it.
- Never build class names by interpolation (`bg-${accent}`) — use the maps in
  `src/components/ui/accent.ts`.
- Server Components by default; `"use client"` only where needed, pushed as
  far down the tree as possible.
- All other conventions: `docs/06-conventions.md`.

# A feature is not done until `docs/` is updated

**Every time you add, change, or remove a feature, update `docs/` in the same
turn — before you report the work as finished.** Not "later", not "if asked".
The docs are the next session's only context; stale docs are worse than none.

Definition of done for any code change:

1. Code written.
2. Affected docs updated — the trigger table in
   `docs/07-maintaining-these-docs.md` says which file.
3. If you shipped something listed under "does NOT exist yet" in
   `docs/01-overview.md`, move it up to "works today".
4. If you established a new pattern, add it to `docs/06-conventions.md`.
5. If you added a migration, document it in `docs/03-data-model.md` **and** tell
   the user to run it by hand — you cannot run it for them.

Then report what changed and suggest a commit message. Leave everything
uncommitted (see the git rule above).

# Read `docs/` first

`docs/` is the maintained description of this whole project. **Read it instead
of scanning `src/`.** Start at [docs/README.md](docs/README.md) — it has the
reading order and a 30-second summary.

- What/why/stack, and what is NOT built yet → `docs/01-overview.md`
- Request flow, server/client boundary, the add-kos flow → `docs/02-architecture.md`
- `Kos` type, Supabase schema, migrations → `docs/03-data-model.md`
- Tokens, accents, UI primitives, Leaflet styling → `docs/04-design-system.md`
- Which file owns what, one line each → `docs/05-file-map.md`
- Rules to follow when writing code here → `docs/06-conventions.md`
- The UI/UX revamp plan, phase by phase → `docs/ui-workflow.md`

Then open only the source files `docs/05-file-map.md` points you at.
