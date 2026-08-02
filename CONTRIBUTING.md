# Contributing to Rahman Resources (rr)

rr is a **copy-first slice library** + docs site. Slices are vertical features that
consumers install with `npx rr add <slug>` — the files are copied into the consumer's
repo and owned by them. There is no runtime npm dependency on rr. Read `CLAUDE.md` at the
repo root for the full architecture and hard rules before making structural changes.

## Quick start

```bash
npm install            # also wires git hooks via the `prepare` script (core.hooksPath .githooks)
npm run dev            # site at http://localhost:3000
npm run dev:alt        # second instance at :3457 (parallel sessions)
```

MCP server (for Claude Code / MCP-aware clients):

```bash
npx rahman-resources-mcp
```

## Three surfaces that must stay in sync

A change to what slices/skills exist usually touches more than one of these:

| Surface | Path | Truth source |
|---|---|---|
| CLI installer | `packages/cli` (`rahman-resources`) | `packages/cli/lib/manifest.json` |
| MCP server | `packages/mcp` (`rahman-resources-mcp`) | reads the sibling CLI manifest |
| Bundle Builder UI | `app/(docs)/build` | `lib/build/compat.ts` |

Skills SSOT is `lib/content/claude-skills.ts`. After editing it:

```bash
node packages/cli/scripts/sync-skills.mjs          # write packages/cli/lib/skills.json
node packages/cli/scripts/sync-skills.mjs --check   # CI/pre-commit guard
```

## Adding a slice

```bash
npm run new:slice <name>     # scaffold frontend/slices/<name>/
```

Then implement:

1. Frontend at `frontend/slices/<name>/` (`components/`, `lib/`, `hooks/`, `config/`, …).
2. If it needs a backend, add **copy-source** Convex functions at `convex/features/<name>/`
   (these do **not** run on rr's own backend — the deploy allowlist keeps them off it;
   consumers compose them into their own backend). Do **not** add the schema to
   `convex/schema.ts` — that turns the library into a monolith (Hard Rule 6).
3. Keep the metadata trio coherent: `slice.json` + `slice.contract.ts` + `slice.manifest.json`.
4. Imports inside a slice must resolve via `@/components/ui/*`, `@/shared/*`,
   `@/features/<own-slug>/*`, `@convex/*`, or relative-within-slice. No `../../` reaching out
   (Hard Rule 5).
5. Add a `ChangelogEntry` (`lib/content/changelog/part-01.ts`, prepend) so the
   `RecentlyUpdatedBadge` surfaces it. Entry date = UTC midnight of today, never the future.

## Validation tiers

Run before pushing. Pick the tier that matches your loop:

```bash
npm run slices:check       # slice naming/imports/trio/changelog audits (~10s)
npm run validate:all:quick # everything except vitest (~20s)
npm run validate:all       # full chain incl. typecheck + vitest (~30s)
npm test                   # vitest suite
npm run typecheck          # tsc --noEmit (heap-bumped)
```

## Git hooks (local CI)

`npm install` points `core.hooksPath` at `.githooks/`.

- **pre-commit** — typecheck + contract validator + slice/template/file-size audits +
  agent.md drift + changelog validation + skills sync. Fast, authoritative.
- **pre-push** — catalog gates + vitest + `next build` (catches Next-only errors tsc misses).

If a hook fails, run the named `npm run <check>` to see the full error. Bypass (cautiously,
only when you understand why) with `git commit --no-verify` / `git push --no-verify`.

## Publishing (maintainer only)

CLI + MCP are the distribution channel. A publish is warranted when **all** hold:

1. Files in `packages/cli/` or `packages/mcp/` changed.
2. `version` bumped above `npm view <pkg> version`.
3. `npm run typecheck` is green.
4. Pushed to `main`.

Then a maintainer runs the OTP step (`cd packages/cli && npm publish --otp=…`). Do not run
`npm publish` as part of a normal contribution. `prepublishOnly` runs the sync/peer guards,
so a drifted publish is impossible.

## Style

- All UI composes shadcn primitives — no raw `<button>`/`<dialog>`/`<input type=date|file>`.
- `next/link` (or `SmartLink`) for internal links, `next/image` for images.
- Convex queries use `.withIndex(...).take(N)` — never bare `.collect()`.
- Public Convex functions always declare an `args` validator.
- Files cap at 200 LOC (`audit:file-size` enforces it) — split early.
