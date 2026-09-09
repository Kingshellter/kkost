@AGENTS.md

# Git is manual — never run it

**Never run `git commit`, `git push`, or `git pull` in this repo.** Not even
when the work is finished, not even when asked to "save" or "wrap up", not with
`--no-verify`, not via an alias, script, or subagent. The same applies to
`gh pr create`, `gh pr merge`, and anything else that writes to GitHub.

The maintainers do all committing, pushing, and pulling themselves, by hand.

- Do: edit files, leave changes in the working tree, and say what changed.
- Do: run read-only git (`git status`, `git diff`, `git log`) when you need context.
- Do: offer a commit *message* as text if it is useful.
- Do not: stage, commit, push, pull, fetch-and-merge, rebase, or open a PR.
- Do not: ask "commit?" at the end of a task — just report what changed.

If a task seems to require a commit, stop and hand it back to the user instead.

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

Then report what changed. Leave everything uncommitted (see the git rule above).

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

Then open only the source files `docs/05-file-map.md` points you at.

After changing code, update the affected doc **in the same commit** — the
trigger table is in `docs/07-maintaining-these-docs.md`.
