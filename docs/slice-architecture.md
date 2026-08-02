# Slice Architecture — Adoption Plan

> **Status**: Draft v1 — 2026-05-09
> **Owner**: kitab maintainers (rahman + Claude agents)
> **Lifecycle**: This doc is the master plan. Each phase below has a tasklist with file paths; tick as you land them. Once Phase 6 is done, archive this file under `docs/done/` and link from `PROGRESS.md`.

## Why this exists

`rahman-resources` ships three artifact tiers today:

1. **Starter** — fresh Next 16 + Convex + shadcn skeleton (`packages/cli/lib/starter/`).
2. **Website templates** — full apps you scaffold in (e.g., `personal-brand-os`).
3. **Features (shallow)** — `lib/content/features.ts` entries that are just install snippets + docs (no shipped code).

The gap: tier-3 is shallow. Want X feature? You read the install line, copy example code by hand, wire it into your project. There is no atomic, copy-paste-and-it-works code unit.

Superspace has the right pattern: every capability lives as a **vertical slice** — one folder containing convex schema + queries + actions + frontend page + components + config + auto-registration. The slice is portable: lift its folder, drop it into a new project, run `npx rr add` to register it, and it works.

This plan adapts the superspace slice pattern into `rahman-resources` so:

- Features become real, atomic, copy-paste portable code units (tier 3 deep).
- Anything we build in superspace can be lifted into kitab → distributed via npm/tiged → composed back into another project.
- Composition is mechanical: pick template + N slices → bundle builder emits a single `npx` command run.

## Goals & non-goals

### Goals

- A **slice contract** (`slice.json` per slice) that machines can validate.
- Path alias unification (`@/*`, `@/shared/*`, `@/features/*`, `@convex/*`) across superspace, kitab, starter, all consumer apps.
- One canonical chrome (`components/shared/layout/*`) used by both kitab AND superspace.
- Bidirectional `lift` mechanism: pull a slice from anywhere → drop into any compatible project.
- Existing tier-2 templates keep working untouched. Convert is opt-in.

### Non-goals

- We are NOT rewriting the existing 7 templates from monolith → composed-of-slices in this plan. They keep shipping as-is.
- We are NOT introducing a runtime DI container. Slice composition is build-time / source-time only.
- We are NOT versioning the kitab itself per slice; the npm package version stays kitab-wide. Slice semver is metadata-only inside `slice.json`.

## Decisions (defaults)

| # | Question | Default | Change by editing |
|---|---|---|---|
| 1 | Where do slices live in the kitab? | `frontend/slices/<slug>/` (top-level, mirrors superspace 1:1) | This doc + Phase 1 |
| 2 | Tier-2 vs tier-3 relationship | Coexist. Templates stay monolithic. Slices are a separate composable tier. | This doc |
| 3 | Naming for shallow vs deep | "Feature" = shallow integration descriptor (current `features.ts`); "Slice" = deep vertical code unit (new `slices.ts`) | This doc |
| 4 | Chrome source-of-truth | Kitab owns it. Lift superspace `frontend/shared/ui/layout/*` → kitab `components/shared/layout/*`. Superspace then consumes via `lift`. | Phase 1 |
| 5 | Lift mechanism | `tiged` pull on-demand from kitab repo (current pattern for templates). No tarball bloat. | Phase 3 |
| 6 | Audit-bp port timing | Phase 1, mandatory CI gate. | Phase 1 |
| 7 | `@convex-dev/auth` requirement | Optional per-slice peer (declared in `slice.json.deps.peers`). | Per slice |
| 8 | Slice versioning | Independent semver per slice in `slice.json.version`. Kitab npm version is decoupled. | Per slice |

## Tier model (target)

```
Tier 1 — Starter         next + convex + shadcn skeleton (existing)
Tier 2 — Website template Full app (existing 7 templates)
Tier 3 — Feature slice   ★ NEW — portable vertical slice (1 problem, 1 unit)
Tier 4 — Lift            Pull arbitrary slice from superspace / GitHub / kitab
```

Each tier composes the one above:

```
[ Tier 4: lift ]──┐
                  ├──> [ Tier 3: slices ] ──> [ Tier 2: templates ] ──> [ Tier 1: starter ]
[ rahman/kitab ]──┘
```

A consumer can stop at any tier. Most will go: `init` (T1) → pick template (T2) → `add` slices (T3) → `lift` ad-hoc (T4 advanced).

## Slice contract (high-level)

Every slice MUST contain a `slice.json` at its root:

```jsonc
{
  "$schema": "https://resource.rahmanef.com/slice-schema.json",
  "slug": "midtrans-payment",
  "version": "0.1.0",
  "category": "payment",
  "title": "Midtrans Payment",
  "description": "Midtrans Snap checkout + webhook handler + history UI",
  "namespace": "@/features/midtrans-payment",
  "convex": {
    "tablesExport": "midtransTables",
    "schemaPath": "convex/features/midtrans-payment/schema.ts",
    "rootPaths": ["convex/features/midtrans-payment"]
  },
  "frontend": {
    "slicePath": "frontend/slices/midtrans-payment",
    "configExport": "midtransPaymentFeature"
  },
  "deps": {
    "npm": ["midtrans-client@^1.4"],
    "shadcn": ["card", "button", "dialog", "input", "label"],
    "env": [
      { "name": "MIDTRANS_SERVER_KEY", "scope": "convex" },
      { "name": "MIDTRANS_CLIENT_KEY", "scope": "next-public" }
    ],
    "peers": [
      { "slug": "convex-auth", "range": "^0.1" }
    ]
  },
  "registers": ["registry", "preview-registry"],
  "audit": ["bp:public-fn-validator", "bp:rls-check"],
  "license": "MIT"
}
```

Field meanings:

| Field | Meaning |
|---|---|
| `slug` | Globally unique slice id (kebab-case). Used by CLI/MCP/registry. |
| `version` | Slice semver, independent of kitab version. Bumped per slice change. |
| `category` | One of: `ai`, `auth`, `data`, `payment`, `email`, `realtime`, `storage`, `search`, `content`, `ui`, `infra`. |
| `namespace` | Import root for slice-internal references. CLI rewrites paths post-pull if user opts a different namespace. |
| `convex.tablesExport` | Name of the table-fragment export in `schema.ts`. Root composes via `...sliceTables`. |
| `convex.rootPaths` | Folders the lift pulls into the consumer's `convex/`. |
| `frontend.configExport` | Name of the `defineFeature(...)` export to register. |
| `deps.npm` | Plain npm install lines. |
| `deps.shadcn` | shadcn primitives this slice imports — auto-installed by `rr add`. |
| `deps.env` | Required env vars + scope. `scope: "convex"` = backend; `"next-public"` = client bundle (NEXT_PUBLIC_*); `"server"` = server-only Next env. |
| `deps.peers` | Other slices this one depends on. Range = semver. |
| `registers` | Which registry generators auto-discover this slice. |
| `audit` | Which audit-bp rules apply. |
| `license` | SPDX. |

The full machine-readable schema lives at `packages/cli/lib/slice-schema.json` (created in Phase 0).

---

## Phase 0 — Slice contract foundation

**Goal**: define the contract + ship a validator + create one reference slice. Nothing else can land cleanly without this.

**Effort**: S (1-2 commits)
**Blocks**: every other phase

### Deliverables

- Master plan doc (this file).
- Machine-readable JSON schema at `packages/cli/lib/slice-schema.json`.
- Validator script that gates every slice via `prepublishOnly`.
- One reference slice at `frontend/slices/_templates/example-feature/` with full `slice.json` + minimal stub code.

### Tasklist

- [ ] Create `docs/slice-architecture.md` (this file).
- [ ] Create `packages/cli/lib/slice-schema.json` — JSON Schema draft 2020-12 covering every `slice.json` field above.
- [ ] Create `packages/cli/scripts/validate-slice.mjs` — reads `slice.json` files matching `frontend/slices/*/slice.json`, validates against schema, exits non-zero on error. Flags: `--check` (silent), `--fix-paths` (best-effort namespace rewrite).
- [ ] Wire `validate-slice.mjs` into `packages/cli/package.json` `prepublishOnly` (chained after existing `sync-skills.mjs --check && validate.mjs`).
- [ ] Wire into `.github/workflows/ci.yml` (typecheck job → add `node packages/cli/scripts/validate-slice.mjs`).
- [ ] Create reference slice tree at `frontend/slices/_templates/example-feature/`:
  - `slice.json` (canonical example, every field populated).
  - `config.ts` — `defineFeature(...)` skeleton.
  - `page.tsx` — minimal page using shared chrome.
  - `components/example-button.tsx`.
  - `types.ts`.
  - `README.md` (one-page authoring guide).
- [ ] Add corresponding `convex/features/example-feature/`:
  - `schema.ts` exporting `exampleFeatureTables = { exampleItems: defineTable({...}) }`.
  - `queries.ts`.
  - `mutations.ts`.

### Acceptance criteria

- `node packages/cli/scripts/validate-slice.mjs` exits 0 on the example slice.
- `node packages/cli/scripts/validate-slice.mjs frontend/slices/_templates/broken-example/` (synthetic broken case in test) exits 1 with a useful error.
- `npm run build` still green.
- `npx tsc --noEmit` still green.

---

## Phase 1 — Mirror superspace slice arch into the kitab

**Goal**: lift the runtime + tooling that makes slices auto-discoverable. After this phase, a freshly added slice gets registered automatically by re-running the generator scripts.

**Effort**: M (4-6 commits, parallelizable)
**Depends on**: Phase 0
**Blocks**: Phase 2-4

### Deliverables

- Slice runtime (`defineFeature`, `registerFeature`, registries).
- 3 registry generators (registry, preview-registry, export-registry).
- Unified shared chrome (three-column, dashboard, sidebar).
- audit-bp validators ported in.
- Path alias unification across kitab + starter.

### Tasklist

#### 1.1 Lift slice runtime

- [ ] Copy `superspace/frontend/shared/lib/features/defineFeature.ts` → `lib/shared/features/defineFeature.ts`.
- [ ] Copy `superspace/frontend/shared/lib/features/registerFeature.ts` → `lib/shared/features/registerFeature.ts`.
- [ ] Copy `superspace/frontend/shared/lib/features/registry.ts` → `lib/shared/features/registry.ts`.
- [ ] Copy `superspace/frontend/shared/lib/features/registry.server.ts` → `lib/shared/features/registry.server.ts`.
- [ ] Adjust imports in copied files: `@/shared/...` aliases (kitab uses bare `@/*` alias mapped wider in tsconfig).
- [ ] Add path aliases to root `tsconfig.json`:
  ```json
  "paths": {
    "@/*": ["./*"],
    "@/shared/*": ["./components/shared/*", "./lib/shared/*"],
    "@/features/*": ["./frontend/slices/*"],
    "@convex/*": ["./convex/*"]
  }
  ```
- [ ] Mirror the same paths in `packages/cli/lib/starter/tsconfig.json`.

#### 1.2 Lift registry generators

- [ ] Copy `superspace/scripts/features/generate-registry.ts` → `scripts/features/generate-registry.ts`.
- [ ] Copy `superspace/scripts/features/generate-preview-registry.ts` → `scripts/features/generate-preview-registry.ts`.
- [ ] Copy `superspace/scripts/features/add-export-import.ts` → `scripts/features/generate-export-registry.ts` (rename to align with template-base convention).
- [ ] Adapt: glob path becomes `frontend/slices/*/config.ts` (was `frontend/slices/*/config.ts` in superspace too — same).
- [ ] Output paths:
  - `lib/shared/features/registry.generated.ts`
  - `lib/shared/features/preview-registry.generated.ts`
  - `lib/shared/features/export-registry.generated.ts`
- [ ] Add npm scripts in root `package.json`: `gen:registry`, `gen:preview-registry`, `gen:export-registry`, `gen:all`.

#### 1.3 Lift shared chrome

- [ ] Copy `superspace/frontend/shared/ui/layout/container/three-column/*` → `components/shared/layout/three-column/*`.
- [ ] Copy `superspace/frontend/shared/ui/layout/dashboard/*` → `components/shared/layout/dashboard/*`.
- [ ] Copy `superspace/frontend/shared/ui/layout/sidebar/primary/AppSidebar.tsx` → `components/shared/layout/sidebar/AppSidebar.tsx`.
- [ ] Generalize `AppSidebar` to consume the slice registry instead of hardcoded nav (signature: `<AppSidebar registry={generatedRegistry} />`).
- [ ] Mark old `components/templates/_shared/ui/admin-shell.tsx` deprecated (header comment) — tier-2 templates keep using it; new tier-3 slices use `components/shared/layout/dashboard/`.

#### 1.4 Slice scaffolding templates

- [ ] Copy `superspace/scripts/features/create.ts` → `scripts/features/create-slice.ts`.
- [ ] Adapt to drop into `frontend/slices/<slug>/` + `convex/features/<slug>/`.
- [ ] Add CLI subcommand: `npx rahman-resources scaffold-slice <slug> [--category <cat>]` in `packages/cli/bin/cli.js`.
- [ ] Source the scaffold from `frontend/slices/_templates/{minimal,crud,full}/` (lifted from superspace `frontend/slices/_templates/`).

#### 1.5 Lift audit-bp validators

- [ ] Copy `superspace/scripts/validation/{audit-feature-uiux,audit-ui-consistency,feature-naming,features}.ts` → `scripts/validation/`.
- [ ] Copy `superspace/scripts/validation/component.ts`, `next-build-budgets.ts`.
- [ ] Add npm script `audit:bp` running the validators in series.
- [ ] Wire into `.github/workflows/ci.yml` (new job `audit-bp` after typecheck).

### Acceptance criteria

- `npm run gen:all` produces all three generated registry files; `git diff` clean (deterministic).
- `npm run audit:bp` exits 0 on the example slice from Phase 0.
- `npx tsc --noEmit` clean.
- `npm run build` clean.

---

## Phase 2 — Convert existing features → slices

**Goal**: every shallow feature in `lib/content/features.ts` gains an actual slice at `frontend/slices/<slug>/` + `convex/features/<slug>/`. Old features.ts entry stays as the metadata layer pointing at the slice.

**Effort**: L (8 PRs, one per feature, parallelizable)
**Depends on**: Phase 1
**Blocks**: Phase 3-4 (but Phase 3 lift mechanism can be drafted in parallel)

### Convention per slice

Each slice gets:

```
frontend/slices/<slug>/
├── slice.json
├── config.ts                # defineFeature({ slug, providers?, ... })
├── page.tsx                 # primary entry route (when applicable)
├── components/              # provider-agnostic UI
│   └── <Capability>.tsx
├── components/providers/    # provider-specific wrappers (when slice supports multiple)
│   └── <provider>.tsx
├── hooks/
├── types.ts
├── store.tsx                # zustand or similar (optional)
└── README.md

convex/features/<slug>/
├── schema.ts                # exports `<slug>Tables = { ... }`
├── queries.ts
├── mutations.ts
├── actions/                 # external IO (provider-specific)
│   └── <provider>.ts
└── README.md
```

`convex/schema.ts` (root) gets a one-liner:

```ts
import { exampleFeatureTables } from "./features/example-feature/schema";
// ...
export default defineSchema({ ...exampleFeatureTables, ...otherFeatureTables });
```

### Per-feature tasklist

8 features. Each row = its own PR.

| Slug | Slice deliverables | Effort |
|---|---|---|
| `convex-auth` | `frontend/slices/convex-auth/{config.ts, components/sign-in.tsx, components/user-button.tsx, hooks/use-current-user.ts, slice.json}` + `convex/features/auth/{schema.ts, providers.ts, README.md}` | M |
| `midtrans-payment` | `frontend/slices/midtrans-payment/{config.ts, components/checkout-button.tsx, components/providers/midtrans.tsx, slice.json}` + `convex/features/payment/{schema.ts, queries.ts, actions/midtrans.ts, README.md}`. Provider sub-folder pattern lets Doku/Stripe land later as siblings (`actions/doku.ts`, `components/providers/doku.tsx`). | M |
| `resend-newsletter` | `frontend/slices/resend-newsletter/{config.ts, components/subscribe-form.tsx, components/admin-list.tsx, slice.json}` + `convex/features/newsletter/{schema.ts, queries.ts, mutations.ts, actions/send.ts, README.md}` | S |
| `convex-vector-search` | `frontend/slices/vector-search/{config.ts, components/search-bar.tsx, components/results.tsx, hooks/use-vector-search.ts, slice.json}` + `convex/features/search/{schema.ts, queries.ts, actions/embed.ts, README.md}` | S |
| `mdx-blog` | `frontend/slices/mdx-blog/{config.ts, components/{list,detail,renderer}.tsx, page.tsx, slice.json}` + `content/blog/.gitkeep` + `convex/features/blog/schema.ts` (optional comments) | S |
| `cal-com-booking` | `frontend/slices/cal-com-booking/{config.ts, components/embed.tsx, slice.json}` + `convex/features/bookings/{schema.ts, queries.ts, README.md}` | S |
| `ai-sdk-openrouter` | `frontend/slices/ai-router/{config.ts, components/chat-fab.tsx, hooks/use-ai.ts, slice.json}` + `convex/features/ai/{schema.ts, queries.ts, actions/router.ts, README.md}` | M |
| `broadcast-channel-sync` | `frontend/slices/broadcast-channel-sync/{config.ts, hooks/use-bc-sync.ts, slice.json}` (no convex). | XS |

Each PR also:

- [ ] Updates `lib/content/features.ts` entry: add `slicePath` + `sliceSlug` pointers.
- [ ] Updates `convex/schema.ts` root composition (spread the new tables).
- [ ] Re-runs `npm run gen:all` and commits the generated files.
- [ ] Passes `npm run audit:bp`.
- [ ] Adds a smoke test at `tests/slices/<slug>.smoke.test.ts` (renders config, validates schema fragment).

### Acceptance criteria per PR

- Slice's `slice.json` validates.
- Slice's tables compose into root schema without conflicts.
- audit-bp passes on the slice path.
- `npm run build` still emits the kitab site cleanly.

---

## Phase 3 — Bridge mechanism (`lift` + `publish-slice`)

**Goal**: turn slices into transportable units. Add CLI commands that pull a slice from any registered source and drop it into the consumer's project, wired up.

**Effort**: M (2-3 commits)
**Depends on**: Phase 0 (contract) + Phase 1 (registry).

### Deliverables

- New CLI subcommand `npx rahman-resources lift <source>:<path>` with sources:
  - `superspace:slices/<slug>` → from `~/projects/superspace/` (local) OR a configured remote.
  - `rahman:<slug>` → from this kitab (uses manifest).
  - `github:<owner>/<repo>/<path>` → arbitrary.
- New CLI subcommand `npx rahman-resources publish-slice <local-slice-dir>` → validates + opens GitHub PR against `rahmanef63/resource-site` adding under `frontend/slices/<slug>/`.
- New manifest section: `slices: SliceEntry[]` mirroring `layouts/recipes/features` shape.
- Source map in `CLAUDE.md` upgraded: every "want X, copy from Y" entry replaced by an `npx rahman-resources lift …` one-liner.

### Tasklist

- [ ] Create `lib/content/slices.ts` — typed list of registered slices (one entry per slice in `frontend/slices/`).
- [ ] Update `packages/cli/scripts/parse-content.mjs` + `gen-manifest.mjs` to load slices and emit a `slices: [...]` block in `manifest.json`.
- [ ] Add `lift` to `packages/cli/bin/cli.js` (new subcommand + helpers `parseLiftSource`, `pullFromSource`, `applySliceManifest`).
- [ ] Add `publish-slice` to `packages/cli/bin/cli.js` (validates locally then `gh pr create` via spawn).
- [ ] Update `CLAUDE.md` source map table — replace path-copy guidance with `lift` commands.

### Acceptance criteria

- `npx rahman-resources lift rahman:example-feature ./test-app` pulls slice + applies its `slice.json` deps in a fresh starter directory.
- `npx rahman-resources publish-slice ./frontend/slices/example-feature` runs the validator locally without errors (dry run mode by default; `--open-pr` to actually submit).

---

## Phase 4 — CLI/MCP/Builder integration

**Goal**: surface slices through every UX channel.

**Effort**: M
**Depends on**: Phase 3

### Tasklist

- [ ] CLI `npx rr add <slug>`: detect if slug is a slice (via manifest). If yes, route to lift flow + auto-apply schema composition + `gen:all`. Existing template/feature/recipe paths unchanged.
- [ ] CLI `npx rr doctor --slices`: validate slice composition in the current project (no missing peers, no version conflicts, no schema-table-name clashes).
- [ ] CLI `npx rr list slices` (extend existing `list` command).
- [ ] CLI `npx rr info <slice-slug>` (works via existing `info` since slice manifest entries share the kind dispatch).
- [ ] MCP — add new tools to `packages/mcp/bin/server.mjs`:
  - `rr_list_slices`
  - `rr_get_slice` (returns full `slice.json` + path manifest)
  - `rr_lift_slice` (programmatic lift — used by agents inside Claude Code)
  - `rr_compose_app` (input: list of slice slugs + target dir; output: composed init+add command sequence)
  - `rr_audit_slice` (run audit-bp programmatically)
- [ ] MCP — add resources `rr://slices`, `rr://slices/<slug>`, `rr://slice-source/<slug>` (returns the slice tree as a tar manifest).
- [ ] Bundle Builder UI (`app/(docs)/build/`) — add a Slices tab between Features and Skills:
  - Multi-select from `manifest.slices`.
  - Show compat warnings (peer missing / conflict).
  - Generated commands include `npx rr add <slice>` per selection.
- [ ] Add `/slices` page (catalog) and `/slices/<slug>` (detail) to `app/(docs)/`.
- [ ] Update `app/(docs)/mcp/page.tsx` — list new MCP tools/resources.
- [ ] Update sidebar (`components/site/docs-sidebar.tsx`) — add "Slices" group with branches by category (matches the Phase-3 sidebar work pattern).

### Acceptance criteria

- `npx rr list` shows slices section.
- `npx rr add convex-auth` (after Phase 2) lifts the slice end-to-end.
- MCP smoke test (`node packages/mcp/bin/server.mjs` then list-tools) returns the 5 new tools.
- Bundle Builder UI emits valid command for `init + 3 slices`.

---

## Phase 5 — Compat matrix + audit hardening

**Goal**: prevent broken compositions before the user runs them.

**Effort**: S (continuous)
**Runs in parallel with**: Phase 2-4

### Tasklist

- [ ] Extend `lib/build/compat.ts` with a `SLICE_COMPAT` matrix:
  ```ts
  export const SLICE_COMPAT: Record<string, {
    requires?: string[];     // peer slices required
    conflicts?: string[];    // mutually exclusive slices
    enhances?: string[];     // optional synergy
  }> = {
    "midtrans-payment": { requires: ["convex-auth"], conflicts: ["stripe-payment"] },
    // ...
  };
  ```
- [ ] Build a `validate-compose.mjs` that takes a slice list and asserts compat.
- [ ] CI matrix job: enumerate top-N popular combos and run `validate-compose` on each.
- [ ] Bundle Builder UI consumes `SLICE_COMPAT` to show real-time warnings.

### Acceptance criteria

- `validate-compose midtrans-payment stripe-payment` exits 1 with a "conflicts with" error.
- `validate-compose midtrans-payment` (without `convex-auth`) exits 1 with a "missing peer" error.

---

## Phase 6 — Docs + adoption

**Goal**: make the new pattern discoverable + teachable.

**Effort**: S
**Depends on**: Phase 4 (so URLs/commands are stable)

### Tasklist

- [ ] `docs/authoring-slices.md` — step-by-step "build your first slice" guide (uses `scaffold-slice`).
- [ ] `docs/lift-from-superspace.md` — the inverse direction.
- [ ] `app/(docs)/slices/page.tsx` — catalog UI (already noted in Phase 4; this task is the polish + screenshots + categories).
- [ ] Update `app/(docs)/build/page.tsx` header + intro copy to mention the slice tier.
- [ ] Update existing `~/.agents/skills/use-skill-coder/SKILL.md` to teach the slice authoring loop.
- [ ] Add a "Slices" section to `README.md` of the kitab repo (and the `packages/cli/README.md`).
- [ ] Update `docs/PROGRESS.md` with each phase's closeout entry as it lands.
- [ ] Once everything ships: archive this file at `docs/done/slice-architecture-2026-05.md` and add a final pointer-link in `PROGRESS.md`.

---

## Risks + rollback

| Risk | Likelihood | Impact | Mitigation / rollback |
|---|---|---|---|
| Path alias unification breaks existing template-base imports | M | M | Land aliases as **additive** first (don't remove old aliases). Migrate per-slice. Keep a 1-release deprecation window. |
| Slice composition produces convex schema name collisions | M | H | `validate-compose` in CI. Schema-table prefix convention (`<slug>_<table>`) for new slices. |
| Generators emit non-deterministic output (git-diff churn) | L | M | Generators sort glob results lexically. CI checks `git diff --quiet` after gen. |
| Lift from arbitrary GitHub URL ships malicious code | L | H | `lift` defaults to `--dry-run` (preview tree before write). User must pass `--apply`. Document. |
| Tier-2 templates fall behind the slice ecosystem | M | L | Acceptable. Document templates as "v1 era" reference and migrate over time when a template's slice equivalent matures. |

## Open questions for later

- Should slices ship a vitest fixture so the smoke tests in Phase 2 are 1-line (`runSliceFixture("midtrans-payment")`)?
- Does the `lift` command need a write-lock file (`.lift-history.json`) so users can rollback a partial lift?
- For multi-provider slices (e.g., `payment` with midtrans + doku), does the slice declare `providers: ["midtrans", "doku"]` in `slice.json` and consumer picks one at install time? Or is each provider its own slice (`midtrans-payment`, `doku-payment`) with shared `payment-base` peer?
  - **Tentative answer**: each provider is its own slice. Shared concerns (types, base table) live in `payment-base`. Provider slices declare `peers: [{ slug: "payment-base" }]`. Easier to validate, easier to compose, easier to publish-slice from a consumer.
  - **Resolved 2026-07-03 → Variants (below).** Reverses the tentative answer: `midtrans-payment` + `doku-payment` collapse into one `payment` slice with `doku` / `midtrans` *variants*. The Convex backend already discriminates on `provider: v.union("midtrans","doku","stripe")`, so the base is genuinely shared. See [`docs/SLICE-CONSOLIDATION-PLAN.md`](./SLICE-CONSOLIDATION-PLAN.md).

---

## Variants (shadcn-style)

A slice with several near-identical surfaces (render modes, providers, layouts) declares **variants** instead of splitting into look-alike slugs. Landed as a purely additive mechanism 2026-07-03 (Phase 0 — no-op on all 78 non-variant slices).

**Folder shape**

```
frontend/slices/<slug>/
├── slice.json            # declares `variants`
├── index.ts              # all-mode switcher (author-written): variant prop → component
├── shared/               # optional — copied for EVERY variant
└── variants/
    ├── <id-a>/index.ts   # exports the SAME canonical component name as index.ts
    └── <id-b>/index.ts
```

**`slice.json`**

```json
"variants": {
  "default": "chat",
  "shared": "shared",
  "items": [
    { "id": "chat",   "title": "Chat",   "description": "Conversational panel." },
    { "id": "studio", "title": "Studio", "description": "Generation canvas." }
  ]
}
```

`default` must be one of `items[].id`; `shared` is optional. `audit:slices` gates that every `items[].id` has a `variants/<id>/` folder, `default ∈ ids`, and `shared/` exists when named.

**Install**

- `npx rr add <slug> <variant>` — copies **only** `variants/<id>/` (its contents flatten into the slice root, so imports resolve at `@/features/<slug>` exactly like a non-variant slice) + `shared/`. The variant `2nd positional` is disambiguated against the declared ids; anything else is the target dir; `--variant <id>` is explicit.
- `npx rr add <slug>` — copies the whole tree (all variants + the root switcher). Pick at runtime via the shadcn-style prop: `<AiWorkspace variant="studio" />`.

**Import rules (flatten-safe):** inside a variant, file→file imports must be relative-within-variant; variant→shared must use `@/features/<slug>/shared/...`; **never** import `@/features/<slug>/variants/<id>/...`. Slice-level `npm`/`shadcn`/`convexPaths`/`version` stay shared across variants in v1 (a single-variant install may pull an unused dep — acceptable; add per-item `npm` later only if a footprint diverges).

**Files that implement it:** `packages/cli/lib/slice-schema.json` (`variants`), `packages/cli/bin/cli.js` (`runAdd`/`runLift`/`resolveLiftPlan`), `packages/cli/scripts/gen-manifest.mjs` (`sliceJsonVariants`, emit-when-present), `scripts/validation/audit-slice.mjs` (gate), `packages/cli/lib/rr-schema.json` + `rr.mjs` (records the installed variant).

---

## Cross-references

- Existing references this plan supersedes / extends: [`CLAUDE.md`](../CLAUDE.md) source map, [`docs/architecture.md`](./architecture.md), [`docs/source-map.md`](./source-map.md).
- Postmortem feeding into this: [`docs/init-cli-postmortem-kam.md`](./init-cli-postmortem-kam.md) (closed in commit `36367d7`).
- Sibling plan: [`docs/p2.6-next16-migration.md`](./p2.6-next16-migration.md) — done.

