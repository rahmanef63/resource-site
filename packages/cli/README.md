# rahman-resources

Scaffolder + template installer for the [Rahman Resources kitab](https://github.com/rahmanef63/resource-site).

## Quick start

```bash
npx rahman-resources init my-app
cd my-app
cp .env.example .env.local         # fill NEXT_PUBLIC_CONVEX_URL
npm install --legacy-peer-deps
npx convex dev --once               # generates convex/_generated
npm run dev
```

`init` ships a minimal Next 16 + React 19 + Convex + Tailwind 4 + shadcn/ui skeleton (~18 files). Then drop in any layout/recipe/feature with `add`.

## Commands

```bash
npx rahman-resources init <app-name>             # scaffold fresh project
npx rahman-resources add <slug> [target-dir]     # drop in a layout/recipe/feature
npx rahman-resources list [layouts|recipes|features]
npx rahman-resources info <slug>
```

### Inspect a template

```bash
npx rahman-resources info personal-brand-os
```

### Install into a project

```bash
# fresh
npx rahman-resources init my-app
cd my-app && npx rahman-resources add personal-brand-os .

# existing
cd existing-app
npx rahman-resources add personal-brand-os .
```

The CLI:

1. Pulls only the folders listed for that template (via [`tiged`](https://github.com/tiged/tiged)) — no full clone.
2. Detects your package manager (`pnpm` / `yarn` / `bun` / `npm`) and installs the template's npm dependencies.
3. Prints the agent recipe: what to wire next.

## What's included

Every template ships:

- The page route(s) under `app/`
- The slice components under `components/templates/<slug>/`
- A drop-in Convex backend slice under `convex/templates/<slug>/` (where applicable)

Schema files are written to `convex/templates/<slug>/schema.ts` — merge into your existing `convex/schema.ts` or move it up.

## Templates (current)

Run `npx rahman-resources list` to see the live catalog. Highlights:

| Slug | Category | What |
|---|---|---|
| `personal-brand-os` | website-template | Public site + admin dashboard for solo brand |
| `dashboard-three-column` | dashboard | Resizable left/main/right with drawer fallback |
| `dashboard-mobile-dock` | dashboard | Native-feel mobile dock + desktop sidebar |
| `cms-public-storefront` | cms | E-commerce / blog storefront |
| `landing-*` | marketing | Hero/bento/masonry/kinetic landings |

## DNA Graph

The kitab tracks slice **lineage** (where a slice came from and how it was transformed) and **adoption** (which downstream consumers picked it up and how much they drifted) in `.kitab/lineage/<slug>.dna.json` files. Together they form a directed graph traversable by humans and Claude (via MCP).

Each DNA file has three sections:

- `id`, `created_at` — slice identity
- `lineage[]` — `{ from, to?, at, transforms[], actor? }` rows recording every harvest hop. `from`/`to` use `<sourceRepo>:<path>` syntax (e.g. `superspace:frontend/slices/auth` → `kitab:0.1.0`). Transforms are tags like `alias-rewrite`, `clerk-strip`, `namespace-rename`.
- `consumers{}` — keyed by consumer name (notion, superspace, careerpack, content, rahmanef, cescadesigns). Each entry records `adopted_at`, `version`, `drift_score` (0-100), and optionally `last_synced_at`.

### `rr graph` command

```bash
npx rahman-resources graph                  # ASCII summary + adoption matrix across all slices
npx rahman-resources graph --all            # same as above (explicit)
npx rahman-resources graph convex-auth      # full lineage tree + consumer rows for one slice
npx rahman-resources graph --json           # machine-readable graph JSON
npx rahman-resources graph convex-auth --json
```

The summary highlights drift: green <15%, yellow 15-39%, red ≥40%. A red cell signals the consumer copy diverged enough that a re-sync from the kitab will conflict — time to lift improvements back UP via `/rr-prep` + `/rr-send`.

### MCP surface

The companion `rahman-resources-mcp` server exposes the same data:

- `rr://graph/lineage` — full graph payload (`{ slices, graph: { nodes, edges } }`)
- `rr://graph/lineage/<slug>` — single slice DNA
- `rr://graph/consumers/<consumer-name>` — every slice that consumer adopted, with version + drift

### Local-only shards

Files matching `.kitab/lineage/*.local.json` are gitignored, so contributors can stage experimental DNA without committing it. Promote to `<slug>.dna.json` to ship it.

## Compose Solver

Phase B of the Slice Composition Compiler. The `compose` subcommand takes the project state from your `rr.json` plus a list of desired slice slugs, then computes a compatible subset (or rejects with a human-readable proof of every conflict).

```bash
npx rahman-resources compose doku-payment mdx-blog
npx rahman-resources compose doku-payment midtrans-payment   # shows the documented collision
npx rahman-resources compose doku-payment --json             # machine-readable
npx rahman-resources compose doku-payment --rr-path ./apps/x/rr.json
npx rahman-resources compose doku-payment --no-deps          # disable transitive dep resolution
```

The solver enforces:

- **auth-mismatch** (blocker) — slice requires auth X, rr.json has Y.
- **table-collision** (blocker) — two slices declare the same Convex table, or a slice's table is already in the target's schema.
- **explicit-conflict** (blocker) — `contract.conflicts: ["<other>:tables.<value>"]` matches `<other>.provides.tables`.
- **missing-dep** (blocker) — slice's `requires.deps[]` missing from both the candidate set and `slicesInstalled`, or the desired slug itself isn't registered.
- **rbac-collision** (warning) — two slices declare the same permission. Surfaced; never blocks.
- **env-missing** (warning) — `requires.env[]` not in the target's `envExisting`. Surfaced; never blocks.

Transitive deps are pulled in automatically (BFS, depth capped at 16, throws on cycle).

### Pre-flight gate on `rr add`

`rr add <slug>` runs the same solver against `[slug]` before any file copy. If any blocker conflicts surface, `add` aborts and prints the proof. Pass `--force` to skip the gate (a warning is logged).

A full algorithm walkthrough with worked examples lives in [`docs/compose-solver.md`](../../docs/compose-solver.md).

## Updating the manifest

The manifest is generated from `site/lib/content/layouts.ts`. To regenerate:

```bash
cd packages/cli
node scripts/gen-manifest.mjs
```

`prepublishOnly` runs this automatically before `npm publish`.

## License

MIT
