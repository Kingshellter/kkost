# 07 · Maintaining these docs

These docs are only useful if they stay true. They are the **first** thing an
agent reads, so a stale line here costs more than a stale comment in a file.

## Definition of done

**A feature is not finished until these docs describe it.** Update them in the
same turn as the code — before reporting the work as done, not "later" and not
only when asked. Every checklist item below is part of finishing the task:

1. Code written.
2. Docs updated per the trigger table below.
3. Anything shipped from "does NOT exist yet" in `01-overview.md` moved up into
   "works today".
4. Any new repeatable pattern added to `06-conventions.md`.
5. Any new migration documented in `03-data-model.md`, **and** the user told to
   run it by hand — agents cannot apply migrations here.

## Trigger table

Update the listed doc **in the same commit** as the code change.

| You changed… | Update |
|---|---|
| Added/removed/renamed a file in `src/` | `05-file-map.md` |
| Added a route, section, or moved the server/client boundary | `02-architecture.md`, `05-file-map.md` |
| Changed the `Kos` type or anything in `src/data/kos.ts` | `03-data-model.md` |
| Wrote a new `supabase/migrations/*.sql`, or changed `toKosRow` | `03-data-model.md` |
| Added a colour, radius, shadow, `@utility`, or accent | `04-design-system.md` |
| Added a shared component under `ui/` | `04-design-system.md`, `05-file-map.md` |
| Added a dependency, or a script in `package.json` | `01-overview.md`, and the setup steps in the root `README.md` |
| Added a migration, or changed the setup steps | root `README.md` — the judges follow it to run the project |
| Added an env var | `01-overview.md`, `.env.example` |
| Shipped something from the "does NOT exist yet" list | `01-overview.md` — move it to "works today" |
| Established a new pattern you want repeated | `06-conventions.md` |

## Rules for writing here

- **State what is true, including what is missing.** The "does NOT exist yet"
  section in `01-overview.md` is the highest-value part of this folder — it stops
  an agent from hunting for an auth flow that was never written.
- **Do not paste code.** Link to the file and describe the contract. Pasted code
  goes stale silently; a link does not.
- **Explain the non-obvious `why`.** `distance_m` vs `distance`, the accent maps
  vs string interpolation, `ssr: false` needing its own client file — those are
  the things a reader gets wrong.
- **Keep line counts approximate.** `~n` in the file map is a size signal, not a
  fact to maintain precisely. Update it when a file changes substantially.
- **Do not duplicate across files.** Cross-link instead. Each fact has one home.

## Quick audit

Cheap consistency check before trusting the file map:

```bash
find src supabase -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.sql' -o -name '*.css' \) | sort
```

Every path it prints should appear in `05-file-map.md`, and nothing else should.
