# rahman-resources

Scaffolder + template installer for the [Rahman Resources kitab](https://github.com/rahmanef63/resource-site).

## Quick start

Choose framework and package manager independently:

```bash
# Next.js + React with npm (default)
npx rahman-resources init my-app --framework react-next --package-manager npm

# SvelteKit + Svelte 5 with Bun
bunx rahman-resources init my-app --framework sveltekit --package-manager bun
```

Then install slices explicitly for the selected renderer:

```bash
# React/Next default
npx rahman-resources add appshell

# SvelteKit
npx rahman-resources add appshell --framework sveltekit

# SvelteKit through Bun
bunx rahman-resources add appshell --framework sveltekit --package-manager bun
```

`init` ships one of two bases: **Next.js 16 + React 19 + Tailwind 4 + Convex + shadcn/ui**, or **SvelteKit 2 + Svelte 5 + Tailwind 4 + Convex**. Full-app templates remain Next.js-specific; the canonical active slice catalog is dual-framework.

## Commands

```bash
npx rahman-resources init <app-name> [--framework react-next|sveltekit] [--package-manager npm|bun]
npx rahman-resources add <slug> [target-dir] [--framework <id>] [--package-manager npm|bun]
npx rahman-resources list [layouts|recipes|features|skills|slices]
npx rahman-resources info <slug>
```

### Package-manager resolution

For existing projects the CLI resolves the package manager from, in order: explicit `--package-manager`, `package.json#packageManager`, `rr.json#packageManager`, then lockfiles (`bun.lock`/`bun.lockb`, `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`). npm and Bun are first-class documented paths; pnpm/yarn detection remains for backwards compatibility.

### Slice variants + frameworks

```bash
rr add settings account                         # React/Next default
rr add settings account --framework sveltekit  # native/shared Svelte distribution
rr add payment doku                            # one provider variant
rr add payment                                 # all provider variants
```

CLI 1.19 adds dual-framework base scaffolding, npm/Bun-aware command execution, modern `bun.lock` detection, framework-aware public env names (`NEXT_PUBLIC_*` vs SvelteKit `PUBLIC_*`), and records each installed slice framework in `rr.json`. Per-variant runtime dependencies from 1.18 remain intact.

## What is portable

- **Canonical active slices:** Next.js/React default + explicit SvelteKit/Svelte 5 distribution.
- **Framework-neutral backend/service slices:** both framework selections reuse the same TypeScript source.
- **Full-app templates/layouts:** Next.js-specific until a layout explicitly declares a Svelte counterpart.
- **Package managers:** npm and Bun are both valid for fresh scaffolds and slice installs.

Run `rahman-resources list` for the live catalog instead of relying on a hardcoded template list.

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
npx rahman-resources compose doku-payment midtrans-payment   # arbitrates the conflict
npx rahman-resources compose doku-payment --json             # machine-readable
npx rahman-resources compose doku-payment --rr-path ./apps/x/rr.json
npx rahman-resources compose doku-payment --no-deps          # disable transitive dep resolution
npx rahman-resources compose doku-payment --strict           # CI gate: uncontracted + warnings → blockers
```

The solver enforces:

- **auth-mismatch** (blocker) — slice requires auth X, rr.json has Y.
- **table-collision** (blocker) — two slices declare the same Convex table, or a slice's table is already in the target's schema. Pair collisions are **arbitrated**: the slice with fewer dependers (or, on ties, the lex-later slug) is dropped — both are no longer rejected.
- **explicit-conflict** (blocker) — `contract.conflicts: ["<other>:tables.<value>"]` matches `<other>.provides.tables`. Also arbitrated.
- **missing-dep** (blocker) — slice's `requires.deps[]` missing from both the candidate set and `slicesInstalled`. Also fires for desired slugs without a contract **only in `--strict` mode**.
- **uncontracted** (warning) — desired slug with no `slice.contract.ts` registered. Accepted by default; flip to blocker with `--strict`.
- **both-installed-conflict** (warning) — both colliding slices are already in `state.slicesInstalled`; neither is dropped.
- **rbac-collision** (warning) — two slices declare the same permission. Surfaced; never blocks.
- **env-missing** (warning) — `requires.env[]` not in the target's `envExisting`. Surfaced; never blocks (elevated to blocker in `--strict`).

Transitive deps are pulled in automatically (BFS with proper visited-set; throws with the full path on cycle, e.g. `dependency cycle detected: a → b → c → a`).

### Strict mode (`--strict`)

Pass `--strict` to either `compose` or `add` to flip into CI-gate behavior: every warning is elevated to a blocker, and uncontracted slugs are rejected with `missing-dep`. Use this in CI; use the default for day-to-day operator runs where most slices still ship without contracts.

### Pre-flight gate on `rr add`

`rr add <slug>` runs the same solver against `[slug]` before any file copy. If any blocker conflicts surface, `add` aborts and prints the proof. Pass `--force` to skip the gate (a warning is logged), or `--strict` to enforce strict-mode checking.

A full algorithm walkthrough with worked examples lives in [`docs/compose-solver.md`](../../docs/compose-solver.md).

## Bidirectional Sync

Most slice registries push updates one-way (registry → consumer). The kitab is bidirectional: when an upstream slice improves, consumers can pull the update via 3-way semantic merge — file-level + contract-surface — without losing local customizations.

```bash
npx rahman-resources update <slug>                # dry-run preview (default)
npx rahman-resources update <slug> --apply        # write merged files
npx rahman-resources update <slug> --apply --force  # apply even with conflicts (kitab wins)
npx rahman-resources update <slug> --json         # machine-readable report
npx rahman-resources update <slug> --rr-path P    # point at an rr.json outside cwd
```

The engine emits a `MergeReport` with per-element outcomes (`auto-merged`, `consumer-wins-clean`, `kitab-wins-clean`, `conflict`, `identical`), a summary, and `driftAfterMerge` (0-100). When the merge is clean it also produces a ready-to-write `mergedSnapshot`.

Conflicts surface a `conflictHint` describing why (e.g. _"kitab dropped `paymentOrders`; consumer still relies on it"_). Re-sync activity is appended as a `3-way-merge` lineage entry, and the consumer's `drift_score` is updated so `rr graph` reflects reality.

See [docs/bidir-sync.md](../../docs/bidir-sync.md) for the full algorithm + drift-score formula.

## Migration Planner

When a slice contract changes shape between versions, `rr migrate` generates a concrete, risk-scored migration plan — Convex schema deltas, env adds, RBAC patches — including ready-to-paste artifacts and ready-to-write `convex/migrations/*.ts` files.

```bash
npx rahman-resources migrate <slug> --from <v1> [--to <v2>]              # ASCII plan
npx rahman-resources migrate <slug> --from <v1> --json                   # machine-readable
npx rahman-resources migrate <slug> --from <v1> --write-files            # materialize convex/migrations/
npx rahman-resources migrate <slug> --from <v1> --write-files --force-overwrite
```

Step kinds: `convex-schema-{add,drop,rename}-table`, `env-{add,remove}`, `rbac-{add,remove}-permission`, `route-{add,remove}` (info-only). Each step carries `risk` (low/medium/high), `reversible` (bool), and pre-rendered artifacts (Convex schema snippet, full migration body, env line, RBAC patch).

Rename detection: when the new contract declares `migrationFrom: { "<old-version>": "<marker>" }`, the planner pairs single-sided table additions/removals positionally and emits a single reversible `convex-schema-rename-table` step instead of a destructive drop+add. The marker string is opaque — only its presence matters. See [docs/migration-planner.md](../../docs/migration-planner.md) for the full algorithm and the DOKU rename proof.

On `--write-files` the CLI appends a DNA lineage entry (`transforms: ["migration-applied", "<step-ids>"]`) so `rr graph` reflects the migration.

## Updating the manifest

The manifest is generated from `site/lib/content/layouts.ts`. To regenerate:

```bash
cd packages/cli
node scripts/gen-manifest.mjs
```

`prepublishOnly` runs this automatically before `npm publish`.

## License

MIT
