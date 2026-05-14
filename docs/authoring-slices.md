# Authoring a slice

A slice is a portable vertical feature unit. One folder, copy-paste anywhere it compiles. See [`slice-architecture.md`](./slice-architecture.md) for the full plan + contract.

## Contract (preferred)

Phase A of the **Slice Composition Compiler** introduces a typed DSL — `slice.contract.ts` — that replaces `slice.manifest.json` as the primary spec for new slices. The JSON manifest stays in the tree for back-compat with the npm CLI manifest pipeline, but new authoring should ship a contract.

A contract is a single `.ts` file at the slice root:

```ts
// frontend/slices/<slug>/slice.contract.ts
import { defineSliceContract } from "../../../packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "doku-payment",                 // kebab-case, must match folder name
  version: "0.1.0",                   // semver
  requires: {
    auth: "convex",                   // "convex" | "clerk" | "next-auth" | "none"
    rbac: ["payment.create-order"],   // "<domain>.<action>" template literal
    env: ["DOKU_CLIENT_ID", "DOKU_SECRET_KEY"],
    convex: {
      prefix: "doku_",                // every table the slice owns starts with this
      tables: ["doku_orders", "doku_webhook_events"],
    },
    deps: ["convex-auth"],            // other slice ids this depends on
  },
  provides: {
    routes:     ["/checkout/doku"],
    hooks:      ["useDokuCheckout"],
    tables:     ["doku_orders", "doku_webhook_events"],
    events:     ["payment.captured", "payment.failed"],
    components: ["DokuCheckoutButton"],
  },
  conflicts: [
    // "<slug>:<routes|hooks|tables|events|components>.<value>"
    "midtrans-payment:tables.paymentOrders",
  ],
  migrationFrom: { "0.0.x": "doku-payment-0.1.0-rename-tables" },
});
```

### Invariants enforced at runtime

`defineSliceContract()` throws (with a descriptive message) when any of these fail:

- `id` must be kebab-case.
- `version` must be semver (`MAJOR.MINOR.PATCH` + optional pre-release/build).
- Every entry in `requires.convex.tables` must start with `requires.convex.prefix`.
- Every entry in `provides.tables` (when `requires.convex` is set) must also start with the prefix.
- Every `conflicts[]` entry must match `<slug>:<key>.<value>` where `<key>` is one of `routes | hooks | tables | events | components`.
- Every `requires.rbac[]` entry must be a `domain.action` pair (exactly one dot).

### Cross-slice validator

```
node scripts/validation/validate-contract.mjs            # human-friendly
node scripts/validation/validate-contract.mjs --check    # CI mode (non-zero on fail)
```

Wired into `npm run slices:check` and exposed as `npm run validate:contracts`. The validator:

1. Scans `frontend/slices/*/slice.contract.ts` and `template-base/frontend/slices/*/slice.contract.ts`.
2. Loads each via `tsx` (falls back to regex shape-check when tsx is unavailable).
3. Re-runs the same shape checks as `defineSliceContract()` (defensive against drift).
4. **Cross-slice conflict detection** — when slice A declares `conflicts: ["slice-b:tables.foo"]` AND slice B's `provides.tables` contains `"foo"`, the validator surfaces a P0 finding:

```
not ok 5 - frontend/slices/doku-payment/slice.contract.ts: conflict with midtrans-payment on tables.paymentOrders
```

This catches the documented `paymentOrders` collision between the sibling DOKU and Midtrans payment slices.

### Coexistence with `slice.manifest.json`

- New slices: author both. The contract is the typed source of truth; the JSON manifest stays for the CLI's `packages/cli/lib/manifest.json` pipeline.
- Existing slices: nothing breaks — `slice.manifest.json` continues to drive the `validate:manifests` step.
- The two specs must stay coherent. A future Phase B compiler will generate the JSON manifest from the contract automatically.

## Quick path (kitab maintainer — scaffold + register)

```bash
npm run new:slice -- --slug my-feature --category data --title "My Feature"
```

This (script: `scripts/features/scaffold-slice.mjs`):
1. Copies `frontend/slices/_templates/example-feature/` → `frontend/slices/<slug>/`
2. Copies `convex/features/example-feature/` → `convex/features/<slug>/`
3. Rewrites every identifier (`example-feature` / `exampleFeature` / `ExampleFeature`) to your slug
4. Patches `slice.json` (category, title, description)
5. Appends a stub `SliceEntry` to `lib/content/slices.ts`
6. Runs `npm run slices:check` — fails fast if anything regressed

After scaffolding: replace stub UI/backend with real code, fill rich metadata in `lib/content/slices.ts`, run `npm run manifest:sync`, commit.

For the comprehensive checklist (especially when porting from superspace/external sources), see [`lifting-features.md`](./lifting-features.md). Drive the whole flow with the `/rr` Claude skill (at `.claude/skills/rr/SKILL.md`).

## Quick path (downstream consumer — install in your app)

```bash
npx rahman-resources add <slug>          # pull a published slice
npx rahman-resources scaffold-slice <slug> --category data   # scaffold a new slice in your project
npx rahman-resources lift superspace:frontend/slices/<x>     # lift directly from superspace
```

## Modify an existing slice's metadata

```bash
npm run modify:slice -- --slug <slug> --add-npm "pkg@^1" --add-shadcn dialog --bump minor
```

Patches both `slice.json` AND `lib/content/slices.ts` in one pass. See `node scripts/features/modify-slice.mjs` for all flags.

## Manual path

1. `cp -r frontend/slices/_templates/example-feature frontend/slices/<slug>` (or scaffold via CLI above).
2. `cp -r convex/features/example-feature convex/features/<slug>`.
3. Edit `frontend/slices/<slug>/slice.json` — set new slug, title, description, namespace, deps.
4. Edit `frontend/slices/<slug>/config.ts` — match the new slug, set routes, nav, peers.
5. Replace `page.tsx` + `components/*` with your real UI.
6. Replace `convex/features/<slug>/{schema,queries,mutations}.ts` with real backend code.
7. Spread the slice's tables into the root convex schema:
   ```ts
   import { mySliceTables } from "./features/<slug>/schema";
   export default defineSchema({ ...mySliceTables, /* others */ });
   ```
8. Run `npm run gen:slices` to regenerate registry-generated files.
9. Run `npm run slices:check` (validate + audit + gen-drift gate).
10. Commit. If publishing back to the kitab: `npx rahman-resources publish-slice frontend/slices/<slug>`.

## What slice.json controls

The contract is enforced by `packages/cli/scripts/validate-slice.mjs` against `packages/cli/lib/slice-schema.json`:

- **Identity**: `slug`, `version`, `category`, `title`, `description`, `namespace`.
- **Layout**: `convex.{tablesExport,schemaPath,rootPaths}`, `frontend.{slicePath,configExport}`.
- **Deps**: `npm`, `shadcn`, `env` (with scope: convex / next-public / server), `peers`.
- **Registers**: which generators auto-discover it (`registry`, `preview-registry`, `export-registry`).
- **Audit**: which audit-bp rules apply.
- **Providers**: optional sub-provider list when the slice routes between alternatives (e.g., `["midtrans","doku"]`).

## Constraints (audit-bp enforces)

- Imports inside the slice MUST resolve via `@/components/ui/*`, `@/shared/*`, `@/features/<own-slug>/*`, `@convex/*`, react/next/lucide-react/convex/zod, or relative-within-slice. No deep `../../` reaching out of the slice.
- Convex table names must NOT collide with another slice's tables.
- Slug MUST equal the folder name AND the value in `config.ts`.
- `configExport` SHOULD start with `camelCase(slug)`.

## Provider sub-folder pattern

When a slice supports multiple sibling providers (e.g., payment with Midtrans + Doku):

```
frontend/slices/<slug>/components/providers/
├── midtrans.tsx
└── doku.tsx                    # drop-in sibling

convex/features/<slug>/actions/
├── midtrans.ts
└── doku.ts                     # drop-in sibling
```

Both providers expose the same `<*Checkout amount orderId>` signature. The slice's primary page routes by env (`PAYMENT_PROVIDER=midtrans|doku`) or per-user preference.

Bump `slice.json.providers` to `["midtrans","doku"]` and minor-bump `version` when adding a sibling.

For very-different providers, prefer publishing each as its own slice with `peers: [{ slug: "payment-base" }]` instead — keeps each slice copyable without dragging the other.

## Lift from elsewhere

```bash
npx rahman-resources lift superspace:frontend/slices/<slug> .   # local superspace dir
npx rahman-resources lift github:owner/repo/path .              # arbitrary
npx rahman-resources lift rahman:<slug> .                       # kitab manifest entry
```

Pass `--dry-run` to preview the plan without writing.
